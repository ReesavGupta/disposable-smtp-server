import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

export default class Database {
    private pool: Pool

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.CONNECTION_STRING,
        })
    }

    async connect(): Promise<void> {
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
        } catch (error) {
            console.log(
                `unfortunately something crashed while connecting to the database`
            )
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

    async deleteOldUsers(): Promise<void> {
        await this.pool.query(
            `DELETE FROM users WHERE created_at < NOW() - INTERVAL "30 minutes"`
        )
    }

    async closePoolClient() {
        await this.pool.end()
    }
}
