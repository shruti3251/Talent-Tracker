import { useRef, useState } from 'react'
import { FileText, UploadCloud, UserRound, X } from 'lucide-react'
import { AVAILABILITY_OPTIONS } from '../lib/availability'
import { uploadResume, validateResumeFile } from '../lib/resumeStorage'

const EMPTY_FORM = {
  name: '',
  current_ctc: '',
  expected_ctc: '',
  experience_yrs: '',
  availability: AVAILABILITY_OPTIONS[0].value,
  notes: '',
  resume_url: '',
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900'

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function ResumeDropzone({ existingUrl, file, onFileSelected, onClear, error }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(fileList) {
    const picked = fileList?.[0]
    if (picked) onFileSelected(picked)
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Resume (PDF or Word, max 1MB)
      </span>

      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <FileText className="size-4 text-indigo-500 dark:text-indigo-400" />
            {file.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : existingUrl ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900">
          <a
            href={existingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <FileText className="size-4" />
            View current resume
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-6 text-center transition-colors ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
              : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
          }`}
        >
          <UploadCloud className="size-6 text-slate-400" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Drag & drop PDF or Word file, or click to browse
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function CandidateForm({ verb, initialValues, submitLabel, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleFileSelected(file) {
    const validationError = validateResumeFile(file)
    if (validationError) {
      setResumeError(validationError)
      return
    }
    setResumeError(null)
    setResumeFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const isBlank = (v) => v === '' || v === null || v === undefined
    if (
      !form.name.trim() ||
      isBlank(form.current_ctc) ||
      isBlank(form.expected_ctc) ||
      isBlank(form.experience_yrs)
    ) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let resume_url = form.resume_url || null
      if (resumeFile) {
        resume_url = await uploadResume(resumeFile)
      }
      await onSubmit({
        name: form.name,
        current_ctc: Number(form.current_ctc),
        expected_ctc: Number(form.expected_ctc),
        experience_yrs: Number(form.experience_yrs),
        availability: form.availability,
        notes: form.notes,
        resume_url,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <UserRound className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {verb} <span className="text-orange-400">Candidate</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <Field label="Full Name" required>
            <input
              required
              autoFocus
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={handleChange('name')}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Current CTC (LPA)" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 8.5"
                value={form.current_ctc}
                onChange={handleChange('current_ctc')}
                className={inputClass}
              />
            </Field>
            <Field label="Expected CTC (LPA)" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12"
                value={form.expected_ctc}
                onChange={handleChange('expected_ctc')}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Experience (Yrs)" required>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 5"
                value={form.experience_yrs}
                onChange={handleChange('experience_yrs')}
                className={inputClass}
              />
            </Field>
            <Field label="Availability">
              <select value={form.availability} onChange={handleChange('availability')} className={inputClass}>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              rows={3}
              placeholder="Interview feedback, skills, impressions..."
              className={inputClass}
            />
          </Field>

          <ResumeDropzone
            existingUrl={form.resume_url}
            file={resumeFile}
            onFileSelected={handleFileSelected}
            onClear={() => setResumeFile(null)}
            error={resumeError}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              {submitting ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
