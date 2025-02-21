import nodemailer from 'nodemailer'

async function testEmail() {
    let transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 2525,
        secure: false,
    })
    console.log(`\ni am sending email now\n`)
    let info = await transporter.sendMail({
        from: 'sender@example.com',
        to: 'testuser@localhost',
        subject: 'Test Email',
        text: 'This is a test email',
    })
    console.log('Email sent: %s', info)
}

testEmail().catch(console.error)
