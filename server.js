import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEM_API)

app.post('/gemini', async (req, res) => {
    const model = genAI.getGenerativeModel({
        // model: 'gemini-pro',
        model: 'gemini-1.5-flash',
        systemInstruction: "You are a senior software engineer helping develop junior and mid level software engineers. You want the engineers to find the solution by doing their own research. Only provide hints, tips, and methods that can be used for further development related to the query."
    })

    const chat = model.startChat({
        history: req.body.history
    })
    const msg = req.body.message

    const result = await chat.sendMessage(msg)
    const response = await result.response
    const text = response.text()
    res.send(text)
})

app.listen(PORT, () => console.log(`All systems go captain at port ${PORT}`))