import dotenv from 'dotenv'
import net from 'net'
import Database from './db/database'
import SMTPHandler from './handlers/smtpHandler'
import { startHttpServer } from './handlers/httpServer'

dotenv.config()

const SMTP_PORT = Number(process.env.SMTP_PORT) || 25
const HTTP_PORT: number = Number(process.env.HTTP_PORT) || 3000

async function startServers() {
    const db = new Database()

    try {
        await db.connect()
        console.log('Database connected successfully.')
    } catch (err) {
        console.error('Failed to connect to the database:', err)
        process.exit(1)
    }

    const smtpHandler = new SMTPHandler(db)
    const smtpServer = net.createServer(
        smtpHandler.handleConnection.bind(smtpHandler)
    )

    smtpServer.listen(SMTP_PORT, () =>
        console.log(`SMTP Server listening on port ${SMTP_PORT}`)
    )

    startHttpServer(db, HTTP_PORT)

    const gracefullShutdown = async () => {
        console.warn('Shutting down servers...')

        return new Promise<void>((resolve) => {
            smtpServer.close(() => {
                console.log('SMTP Server closed.')
                resolve()
            })
        }).then(async () => {
            await db.closePoolClient()
            console.log('Database connection closed.')
            process.exit(0)
        })
    }

    process.on('SIGINT', gracefullShutdown)
    process.on('SIGTERM', gracefullShutdown)

    smtpHandler.startCleanupRoutine()
}

startServers().catch((err) => {
    console.error('Fatal error starting servers:', err)
    process.exit(1)
})
