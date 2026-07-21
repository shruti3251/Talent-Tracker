import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
})

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are accepted.'))
      return
    }
    cb(null, true)
  },
})

const router = Router()

router.post('/', (req, res) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }
    const base = process.env.PUBLIC_API_URL || 'http://localhost:3001'
    res.status(201).json({ url: `${base}/uploads/${req.file.filename}` })
  })
})

export default router
