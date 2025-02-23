import { Email } from '@/app/dashboard/page'
import { ParsedEmail } from '@/types'

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
export function parseEmail(emailString: string): ParsedEmail {
    // Split at "charset=utf-8" to get the body
    const [headerPart, bodyPart] = emailString.split('charset=utf-8\n')

    // Parse headers
    const headerLines = headerPart.split('\n')
    const headerMap: { [key: string]: string } = {}

    headerLines.forEach((line) => {
        const [key, ...valueParts] = line.split(': ')
        const value = valueParts.join(': ')
        if (key && value) {
            headerMap[key] = value
        }
    })

    // Create parsed email object
    const parsedEmail: ParsedEmail = {
        from: headerMap['From'],
        to: headerMap['To'],
        subject: headerMap['Subject'],
        messageId: headerMap['Message-ID'],
        date: new Date(headerMap['Date']),
        text: bodyPart ? bodyPart.trim() : '',
    }

    return parsedEmail
}
