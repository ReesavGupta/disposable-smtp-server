import Database from '../db/database'
import net from 'net'
import { RESPONSES } from '../config/responses'
import { validateEmail } from '../utils/helperFunctions'

const DOMAIN = process.env.MAIL_DOMAIN
if (!DOMAIN) {
    throw new Error('MAIL_DOMAIN environment variable is not set')
}

interface SMTPSession {
    sender: string
    receiver: string
    data: string
    dataMode: boolean
}

export default class SMTPHandler {
    private db: Database
    private readonly domain: string

    constructor(db: Database) {
        this.db = db
        this.domain = DOMAIN!
    }

    public handleConnection(socket: net.Socket) {
        const session: SMTPSession = {
            sender: '',
            receiver: '',
            data: '',
            dataMode: false,
        }

        // Set timeout and encoding
        socket.setTimeout(300000) // 5 minutes timeout
        socket.setEncoding('utf8')

        // Send welcome message
        socket.write(RESPONSES.WELCOME)

        socket.on('error', (error) => {
            console.error('Socket error:', error)
            socket.end(RESPONSES.SYSTEM_ERROR)
        })

        socket.on('timeout', () => {
            console.warn('Socket timeout')
            socket.end(RESPONSES.TIMEOUT)
        })

        socket.on('data', async (chunk) => {
            try {
                await this.handleCommand(
                    socket,
                    chunk.toString().trim(),
                    session
                )
            } catch (error) {
                console.error('Error handling command:', error)
                socket.write(RESPONSES.SYSTEM_ERROR)
            }
        })

        socket.on('close', () => {
            console.log('Connection closed')
        })
    }

    private async handleCommand(
        socket: net.Socket,
        message: string,
        session: SMTPSession
    ) {
        if (session.dataMode) {
            return this.handleDataMode(socket, message, session)
        }

        if (
            message.toUpperCase().startsWith('HELO') ||
            message.toUpperCase().startsWith('EHLO')
        ) {
            socket.write(RESPONSES.HELLO)
        } else if (message.toUpperCase().startsWith('MAIL FROM:')) {
            const sender = message.slice(10).trim()
            if (!validateEmail(sender)) {
                return socket.write(RESPONSES.INVALID_EMAIL)
            }
            session.sender = sender
            socket.write(RESPONSES.OK)
        } else if (message.toUpperCase().startsWith('RCPT TO:')) {
            const receiver = this.parseRecipient(message.slice(8).trim())
            if (!receiver) {
                return socket.write(RESPONSES.INVALID_EMAIL)
            }

            const [username, domain] = receiver.split('@')
            // if (domain !== this.domain) {
            //     return socket.write(
            //         `550 Only accepts emails for @${this.domain}\r\n`
            //     )
            // }

            const userExists = await this.db.userExists(username)
            if (!userExists) {
                return socket.write(RESPONSES.USER_NOT_FOUND)
            }

            session.receiver = receiver
            socket.write(RESPONSES.OK)
        } else if (message.toUpperCase() === 'DATA') {
            if (!session.sender || !session.receiver) {
                return socket.write(RESPONSES.BAD_SEQUENCE)
            }
            session.dataMode = true
            socket.write(RESPONSES.DATA_START)
        } else if (message.toUpperCase() === 'QUIT') {
            socket.write(RESPONSES.GOODBYE)
            socket.end()
        } else {
            socket.write(RESPONSES.UNKNOWN_COMMAND)
        }
    }

    private async handleDataMode(
        socket: net.Socket,
        message: string,
        session: SMTPSession
    ) {
        if (message === '.') {
            session.dataMode = false
            await this.db.saveEmail(
                session.receiver,
                session.sender,
                session.data
            )
            socket.write(RESPONSES.MESSAGE_ACCEPTED)
            session.data = ''
        } else {
            session.data += message + '\n'
        }
    }

    private parseRecipient(address: string): string | null {
        const match = address.match(/<(.+)>/) || [null, address]
        const email = match[1]
        return validateEmail(email) ? email : null
    }

    public startCleanupRoutine() {
        const CLEANUP_INTERVAL = 30 * 60 * 1000 // 30 minutes
        setInterval(async () => {
            try {
                await this.db.deleteOldUsers()
            } catch (error) {
                console.error('Cleanup routine error:', error)
            }
        }, CLEANUP_INTERVAL)
    }
}
