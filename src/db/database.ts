import { Pool, PoolClient } from 'pg'

export default class Database {
    private pool: Pool
    constructor() {
        this.pool = new Pool({
            connectionString: '',
        })
    }
    
}
