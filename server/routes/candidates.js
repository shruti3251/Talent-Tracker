import { Router } from 'express'
import multer from 'multer'
import { sql, poolPromise } from '../db.js'

const router = Router()

const STATUSES = ['shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected']
const AVAILABILITY = ['immediately', '15_days', '1_month', '2_months', 'more_than_2_months']

const LIST_COLUMNS = `
  id, name, current_ctc, expected_ctc, experience_yrs, availability,
  notes, resume_filename, status, created_at, updated_at
`

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are accepted.'))
      return
    }
    cb(null, true)
  },
})

function mapRow(row) {
  const base = process.env.PUBLIC_API_URL || 'http://localhost:3001'
  return {
    ...row,
    current_ctc: row.current_ctc != null ? Number(row.current_ctc) : null,
    expected_ctc: row.expected_ctc != null ? Number(row.expected_ctc) : null,
    experience_yrs: row.experience_yrs != null ? Number(row.experience_yrs) : null,
    resume_url: row.resume_filename ? `${base}/api/candidates/${row.id}/resume` : null,
  }
}

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`SELECT ${LIST_COLUMNS} FROM dbo.candidates ORDER BY created_at DESC`)
    res.json(result.recordset.map(mapRow))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { name, current_ctc, expected_ctc, experience_yrs, availability, notes } = req.body

  if (!name || current_ctc == null || expected_ctc == null || experience_yrs == null) {
    return res.status(400).json({ error: 'name, current_ctc, expected_ctc, and experience_yrs are required.' })
  }
  if (availability && !AVAILABILITY.includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability value.' })
  }

  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('current_ctc', sql.Decimal(6, 2), current_ctc)
      .input('expected_ctc', sql.Decimal(6, 2), expected_ctc)
      .input('experience_yrs', sql.Decimal(4, 1), experience_yrs)
      .input('availability', sql.NVarChar, availability || 'immediately')
      .input('notes', sql.NVarChar(sql.MAX), notes || null).query(`
        INSERT INTO dbo.candidates (name, current_ctc, expected_ctc, experience_yrs, availability, notes)
        OUTPUT ${LIST_COLUMNS.split(',').map((c) => `INSERTED.${c.trim()}`).join(', ')}
        VALUES (@name, @current_ctc, @expected_ctc, @experience_yrs, @availability, @notes)
      `)
    res.status(201).json(mapRow(result.recordset[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body

  if (fields.status && !STATUSES.includes(fields.status)) {
    return res.status(400).json({ error: 'Invalid status value.' })
  }
  if (fields.availability && !AVAILABILITY.includes(fields.availability)) {
    return res.status(400).json({ error: 'Invalid availability value.' })
  }

  const allowed = ['name', 'current_ctc', 'expected_ctc', 'experience_yrs', 'availability', 'notes', 'status']
  const setClauses = []

  try {
    const pool = await poolPromise
    const request = pool.request().input('id', sql.UniqueIdentifier, id)

    for (const key of allowed) {
      if (!(key in fields)) continue
      setClauses.push(`${key} = @${key}`)
      if (key === 'current_ctc') request.input(key, sql.Decimal(6, 2), fields[key])
      else if (key === 'expected_ctc') request.input(key, sql.Decimal(6, 2), fields[key])
      else if (key === 'experience_yrs') request.input(key, sql.Decimal(4, 1), fields[key])
      else if (key === 'notes') request.input(key, sql.NVarChar(sql.MAX), fields[key])
      else request.input(key, sql.NVarChar, fields[key])
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' })
    }

    // Two statements, not OUTPUT INSERTED: the table has an AFTER UPDATE
    // trigger that sets updated_at, and OUTPUT INSERTED reflects the row
    // as this statement left it, before the trigger's own write lands.
    const result = await request.query(`
      UPDATE dbo.candidates
      SET ${setClauses.join(', ')}
      WHERE id = @id;

      SELECT ${LIST_COLUMNS} FROM dbo.candidates WHERE id = @id;
    `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Candidate not found.' })
    }

    res.json(mapRow(result.recordset[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query('DELETE FROM dbo.candidates OUTPUT DELETED.id WHERE id = @id')

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Candidate not found.' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/resume', (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }

    const { id } = req.params
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .input('resume_filename', sql.NVarChar, req.file.originalname)
        .input('resume_data', sql.VarBinary(sql.MAX), req.file.buffer).query(`
          UPDATE dbo.candidates
          SET resume_filename = @resume_filename, resume_data = @resume_data
          WHERE id = @id;

          SELECT ${LIST_COLUMNS} FROM dbo.candidates WHERE id = @id;
        `)

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Candidate not found.' })
      }

      res.json(mapRow(result.recordset[0]))
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message })
    }
  })
})

router.get('/:id/resume', async (req, res) => {
  const { id } = req.params
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query('SELECT resume_filename, resume_data FROM dbo.candidates WHERE id = @id')

    const row = result.recordset[0]
    if (!row || !row.resume_data) {
      return res.status(404).json({ error: 'No resume on file for this candidate.' })
    }

    res.set('Content-Type', 'application/pdf')
    res.set('Content-Disposition', `inline; filename="${row.resume_filename || 'resume.pdf'}"`)
    res.send(row.resume_data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
