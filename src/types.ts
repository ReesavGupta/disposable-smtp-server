export type MailType = {
    to: string
    subject: string
    date: string
    body: string
    from: string
}

export interface ParsedEmail {
    from: string
    to: string
    subject: string
    messageId?: string
    date: string | Date
    text: string
}
