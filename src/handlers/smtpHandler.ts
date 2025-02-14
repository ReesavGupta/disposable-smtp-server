import Database from '../db/database'
import net from 'net'
import { RESPONSES } from '../config/responses'
import { validateEmail } from '../utils/helperFunction'

const DOMAIN = process.env.MAIL_DOMAIN

class SmtpHandler {
    private db: Database
    constructor(db: Database) {
        this.db = db
    }
    public handleConnection(socket: net.Socket) {
        socket.write(RESPONSES.WELCOME)

        let sender = ''
        let reciever = ''
        let data = ''
        let dataMode = false

        socket.on('data', async (chunk) => {
            const message = chunk.toString().trim()

            if (message.startsWith('HELO') || message.startsWith('EHLO')) {
                socket.write(RESPONSES.HELLO)
            } else if (message.startsWith('MAIL FROM:')) {
                sender = message.slice(10).trim()
                if (!validateEmail(sender)) {
                    return socket.write(RESPONSES.INVALID_EMAIL)
                }
                socket.write(RESPONSES.OK)
            } else if (message.startsWith('RCPT TO:')) {
                reciever = message.slice(8).trim()
                if (!validateEmail(sender)) {
                    return socket.write(RESPONSES.INVALID_EMAIL)
                }
                const [username, domain] = reciever.split('@')

                if (domain !== DOMAIN) {
                    socket.write(`550 Only accepts emails for @${DOMAIN}\r\n`)
                }

                if (!(await this.db.userExists(username))) {
                    return socket.write(RESPONSES.USER_NOT_FOUND)
                }
                socket.write(RESPONSES.OK)
            } else if (message.startsWith('DATA')) {
                socket.write(RESPONSES.DATA_START)
                dataMode = true
            } else if (dataMode) {
                if (message === '.') {
                    dataMode = false
                    await this.db.saveEmail(reciever, sender, data)
                    socket.write(RESPONSES.MESSAGE_ACCEPTED)
                    data = ''
                } else {
                    data += message + '\n'
                }
            } else if (message === 'QUIT') {
                socket.write(RESPONSES.GOODBYE)
                socket.end()
            } else {
                socket.write(RESPONSES.UNKNOWN_COMMAND)
            }
        })
    }
    public startCleanUp() {
        setInterval(async () => {
            await this.db.deleteOldUsers()
        }, 30 * 60 * 1000)
    }
}
