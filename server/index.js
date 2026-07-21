import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import candidatesRouter from './routes/candidates.js'
import resumesRouter from './routes/resumes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(uploadDir))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/candidates', candidatesRouter)
app.use('/api/resumes', resumesRouter)

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`TalentFlow API listening on http://localhost:${port}`)
})
