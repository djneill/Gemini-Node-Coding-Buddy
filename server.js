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
    const model = await genAI.getGenerativeModel({
        // model: 'gemini-pro',
        model: 'gemini-1.5-flash',
        systemInstruction: "You are a senior software engineer helping develop junior and mid-level software engineers.Your goal is to encourage them to find solutions through their own research and problem-solving.Only provide hints, tips, and methods that can be used for further development related to the query. Do not provide any code solutions, code snippets, or specific coding instructions. Focus on conceptual explanations, guiding questions, and high-level approaches. If asked for code, remind them to try implementing it themselves based on the provided concepts and methods."
    })

    const chat = model.startChat({
        history: req.body.history
    })
    const msg = req.body.message

    try {
        const result = await chat.sendMessageStream(msg, {
            userInstruction: "Do not provide code. Offer conceptual guidance and tips instead."
        })

        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Transfer-Encoding', 'chunked')

        let text = ''
        for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            text += chunkText
            res.write(text)
        }
        res.end()

    } catch (error) {
        console.error(error)
        res.status(500).send(`An error has occurred ${error}`)
    }
})


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`All systems go captain at port ${PORT}`))