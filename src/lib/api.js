const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: options?.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export function fetchCandidates() {
  return request('/api/candidates')
}

export function createCandidate(fields) {
  return request('/api/candidates', { method: 'POST', body: JSON.stringify(fields) })
}

export function updateCandidate(id, fields) {
  return request(`/api/candidates/${id}`, { method: 'PUT', body: JSON.stringify(fields) })
}

export function deleteCandidate(id) {
  return request(`/api/candidates/${id}`, { method: 'DELETE' })
}

export function uploadCandidateResume(id, file) {
  const formData = new FormData()
  formData.append('resume', file)
  return request(`/api/candidates/${id}/resume`, { method: 'PUT', body: formData })
}
