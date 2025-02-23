import nodemailer from 'nodemailer'

async function testEmail() {
    try {
        let transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 2525,
            secure: false,
        })
        console.log(`\ni am sending email now\n`)
        let info = await transporter.sendMail({
            from: 'mario@example.com',
            to: 'hi@localhost.com',
            subject: 'aighttt lesssgooooooo',
            text: '🦀 lets gettt rustyyyyy',
        })
        console.log('Email sent: %s', info)
    } catch (error) {
        console.log(`some error occured while sending out the mail: ${error}`)
    }
}
testEmail().catch(console.error)
