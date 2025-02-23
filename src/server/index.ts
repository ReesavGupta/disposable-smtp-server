import dotenv from 'dotenv'
import net from 'net'
import Database from '../db/database'
import SMTPHandler from '../handlers/smtpHandler'

dotenv.config()

const SMTP_PORT = parseInt(process.env.SMTP_PORT || '25', 10)

async function startSMTPServer() {
    try {
        const db = new Database()
        const isDbConnected = await db.connect()

        if (!isDbConnected) {
            throw new Error('Failed to connect to the database.')
        }

        console.log('Database connected successfully.')

        // Initialize SMTP server
        const smtpHandler = new SMTPHandler(db)
        const smtpServer = net.createServer(
            smtpHandler.handleConnection.bind(smtpHandler)
        )

        // Start SMTP server
        smtpServer.listen(SMTP_PORT, () => {
            console.log(`SMTP Server listening on port ${SMTP_PORT}`)
        })

        const gracefulShutdown = async () => {
            console.log('Shutting down server...')

            await new Promise<void>((resolve) => {
                smtpServer.close(() => {
                    console.log('SMTP Server closed.')
                    resolve()
                })
            })

            await db.closePoolClient()
            console.log('Database connection closed.')
            process.exit(0)
        }

        smtpHandler.startCleanupRoutine()

        // Handle shutdown signals
        process.on('SIGINT', gracefulShutdown)
        process.on('SIGTERM', gracefulShutdown)
    } catch (err) {
        console.error('An error occurred starting the server:', err)
        process.exit(1)
    }
}

startSMTPServer()
