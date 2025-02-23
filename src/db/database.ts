import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
export default class Database {
    private pool: Pool

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.CONNECTION_STRING,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        })
    }

    async connect(): Promise<boolean> {
        try {
            const poolClientInstance = await this.pool.connect()
            if (!poolClientInstance) {
                throw new Error(`couldn't connect to the database`)
            }
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                CREATE TABLE IF NOT EXISTS emails (
                    id SERIAL PRIMARY KEY,
                    recipient VARCHAR(255) NOT NULL,
                    sender VARCHAR(255) NOT NULL,
                    data TEXT NOT NULL,
                    received_at TIMESTAMP DEFAULT NOW()
                );
            `)
            console.log(`connected to the database sucessfully`)
            return true
        } catch (error) {
            console.log(
                `unfortunately something crashed while connecting to the database`
            )
            return false
        }
    }

    public async addUser(username: string): Promise<void> {
        try {
            if (!username) {
                throw new Error(`username is required`)
            }
            await this.pool.query(
                `INSERT INTO users (username) VALUES ($1) ON CONFLICT DO NOTHING`,
                [username!]
            )
        } catch (error) {
            console.log(`Error: ${error}`)
        }
    }

    public async userExists(username: string): Promise<boolean> {
        const response = await this.pool.query(
            `SELECT 1 FROM users WHERE username=$1`,
            [username!]
        )
        if (!response.rowCount) {
            return false
        }
        return response.rowCount > 0
    }

    async saveEmail(
        recipient: string,
        sender: string,
        data: string
    ): Promise<void> {
        await this.pool.query(
            'INSERT INTO emails (recipient, sender, data) VALUES ($1, $2, $3)',
            [recipient, sender, data]
        )
    }

    async getUserEmails(userEmail: string) {
        const result = await this.pool.query(
            `SELECT * FROM emails WHERE recipient=$1 ORDER BY received_at DESC`,
            [userEmail]
        )
        return result.rows
    }

    async deleteOldUsers(): Promise<void> {
        try {
            await this.pool.query(
                `DELETE FROM users WHERE created_at < NOW() - INTERVAL "30 minutes"`
            )
        } catch (error) {
            console.log('Error while getting emails for user:', error)
        }
    }

    async closePoolClient() {
        await this.pool.end()
    }
}
