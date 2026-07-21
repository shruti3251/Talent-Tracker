import { Router } from 'express'
import { sql, poolPromise } from '../db.js'

const router = Router()

const STATUSES = ['shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected']
const AVAILABILITY = ['immediately', '15_days', '1_month', '2_months', 'more_than_2_months']

function mapRow(row) {
  return {
    ...row,
    current_ctc: row.current_ctc != null ? Number(row.current_ctc) : null,
    expected_ctc: row.expected_ctc != null ? Number(row.expected_ctc) : null,
    experience_yrs: row.experience_yrs != null ? Number(row.experience_yrs) : null,
  }
}

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query('SELECT * FROM dbo.candidates ORDER BY created_at DESC')
    res.json(result.recordset.map(mapRow))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { name, current_ctc, expected_ctc, experience_yrs, availability, notes, resume_url } = req.body

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
      .input('notes', sql.NVarChar(sql.MAX), notes || null)
      .input('resume_url', sql.NVarChar, resume_url || null).query(`
        INSERT INTO dbo.candidates (name, current_ctc, expected_ctc, experience_yrs, availability, notes, resume_url)
        OUTPUT INSERTED.*
        VALUES (@name, @current_ctc, @expected_ctc, @experience_yrs, @availability, @notes, @resume_url)
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

  const allowed = [
    'name',
    'current_ctc',
    'expected_ctc',
    'experience_yrs',
    'availability',
    'notes',
    'resume_url',
    'status',
  ]
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

      SELECT * FROM dbo.candidates WHERE id = @id;
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

export default router
