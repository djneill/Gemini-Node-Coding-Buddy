import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const genAI = new GoogleGenerativeAI(process.env.GEM_API)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.post('/gemini', async (req, res) => {
    const model = genAI.getGenerativeModel({
        // model: 'gemini-pro',
        model: 'gemini-1.5-flash',
        systemInstruction: "You are a senior software engineer helping develop junior and mid level software engineers. You want the engineers to find the solution by doing their own research. Only provide hints, tips, and methods that can be used for further development related to the query. Only provide pseudocode if necessary"
    })

    const chat = model.startChat({
        history: req.body.history
    })
    const msg = req.body.message

    const result = await chat.sendMessage(msg, {
        userInstruction: "Do not provide code. Offer conceptual guidance and tips instead."
    })
    const response = await result.response
    const text = response.text()
    res.send(text)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`All systems go captain at port ${PORT}`))