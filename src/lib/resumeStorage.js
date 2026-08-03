import { supabase } from './supabaseClient'

export const RESUME_MAX_BYTES = 1024 * 1024
export const RESUME_BUCKET = 'resumes'

const RESUME_MIME_EXTENSIONS = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

export function validateResumeFile(file) {
  if (!RESUME_MIME_EXTENSIONS[file.type]) {
    return 'Only PDF or Word files are accepted.'
  }
  if (file.size > RESUME_MAX_BYTES) {
    return 'File is too large — max 1MB.'
  }
  return null
}

export async function uploadResume(file) {
  const error = validateResumeFile(file)
  if (error) throw new Error(error)

  const extension = RESUME_MIME_EXTENSIONS[file.type]
  const path = `${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, { contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
