import net from 'net'
import Database from '../db/database'

class SmtpHandler {
    private db: Database
    constructor(db: Database) {
        this.db = db
    }

    public handleConnection(socket: net.Socket): void {
        console.log(`New smtp connection established ╰(*°▽°*)╯`)
        console.log(`this is socket : ${socket}`)

        let mailFrom = ''
        let rcptTo = ''
        let data = ''
        let dataMode = false

        socket.on('data', async (chunk) => {
            const message = chunk.toString().trim()

            if (dataMode) {
                if (message === '.') {
                    dataMode = false
                    socket.write('250 OK\r\n')
                    await this.db.saveEmail(mailFrom, rcptTo, data)
                    data = ''
                } else {
                    data += message + '\n'
                }
                return
            }
            switch (true) {
                case /^HELO|EHLO/.test(message):
                    console.log(`this is some case`)
                    break
                case message.startsWith('MAIL FROM:'):
                    console.log(`this is MAIL FROM case`)
                    break
                case message.startsWith('RCPT TO:'):
                    console.log(`this is rcpt to case`)
                    break
                case message === 'DATA':
                    console.log(`this is data case`)
                    break
                case message === 'QUIT':
                    console.log(`this is quit case`)
                    break
                default:
                    socket.write(`unrecognized command☹ \r\n`)
            }
        })
        socket.on('error', (err) => console.error('❌ Socket error:', err))
        socket.on('close', () => console.log('🔌 Connection closed.'))
    }
    public startCleanupRoutine(): void {
        setInterval(() => this.db.deleteExpiredEmails(), 60 * 60 * 1000)
    }
}
