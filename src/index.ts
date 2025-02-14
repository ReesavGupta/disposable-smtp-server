import dotenv from 'dotenv'
import Database from './db/database'
dotenv.config()

async function startServers() {
    const db = new Database()
    await db.connect()

    // createa a smtp handler create a start the smtp server
    
    
    // create a http server and start listening on some port

}

startServers()
