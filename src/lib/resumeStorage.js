import { supabase } from './supabaseClient'

export const RESUME_MAX_BYTES = 1024 * 1024
export const RESUME_BUCKET = 'resumes'

export function validateResumeFile(file) {
  if (file.type !== 'application/pdf') {
    return 'Only PDF files are accepted.'
  }
  if (file.size > RESUME_MAX_BYTES) {
    return 'File is too large — max 1MB.'
  }
  return null
}

export async function uploadResume(file) {
  const error = validateResumeFile(file)
  if (error) throw new Error(error)

  const path = `${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, { contentType: 'application/pdf' })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
