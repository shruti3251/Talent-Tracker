import { uploadResumeFile } from './api'

export const RESUME_MAX_BYTES = 1024 * 1024

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
  return uploadResumeFile(file)
}
