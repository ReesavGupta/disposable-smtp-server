import express, { Request, Response } from 'express'
import Database from '../db/database'

export function startHttpServer(db: Database, port: number) {
    const app = express()
    app.use(express.json())

    app.post(
        '/register',
        async (req: Request, res: Response): Promise<void> => {
            try {
                const { username } = req.body
                if (!username) {
                    res.status(400).json({ error: 'Username is required' })
                    return
                }

                await db.addUser(username)
                res.json({
                    email: `${username}@yourdomain.com`,
                    expires_in: '30 minutes',
                })
            } catch (error) {
                console.error('Error registering user:', error)
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    )

    app.listen(port, () =>
        console.log(`🌐 HTTP Server running on port ${port}`)
    )
}
