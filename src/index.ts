import express from 'express'

const app = express()

app.use(express.json())
app.use('/api', () => console.log(`hello world`))

const httpPort = process.env.HTTP_PORT

app.listen(httpPort, () => {
    console.log(`🌐 listening to the api server on port : ${httpPort}`)
})
