'use server'

import Database from '@/db/database'
import { revalidatePath } from 'next/cache'

const db = new Database()
await db.connect()

export async function registerEmail(username: string) {
    if (!username || typeof username !== 'string' || username.length > 255) {
        throw new Error('Invalid username')
    }

    const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
    await db.addUser(sanitizedUsername)

    revalidatePath('/')

    return {
        email: `${sanitizedUsername}@localhost.com`,
        expires_in: '30 minutes',
    }
}

export async function searchEmails(email: string) {
    if (!email || typeof email !== 'string') {
        throw new Error('Invalid email')
    }
    const response = await db.getUserEmails(email)
    return response
}
