import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCandidate,
  deleteCandidate as apiDeleteCandidate,
  fetchCandidates,
  updateCandidate as apiUpdateCandidate,
  uploadCandidateResume,
} from '../lib/api'
import { DEFAULT_STATUS } from '../lib/statuses'

const POLL_INTERVAL_MS = 4000

export function useCandidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const pollRef = useRef(null)

  const refresh = useCallback(async ({ silent } = {}) => {
    try {
      const data = await fetchCandidates()
      setCandidates(data)
      setIsLive(true)
      setError(null)
    } catch (err) {
      setIsLive(false)
      if (!silent) setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    pollRef.current = setInterval(() => refresh({ silent: true }), POLL_INTERVAL_MS)
    return () => clearInterval(pollRef.current)
  }, [refresh])

  const addCandidate = useCallback(async (fields) => {
    try {
      const created = await createCandidate({ ...fields, status: DEFAULT_STATUS })
      setCandidates((prev) => [created, ...prev])
      return created
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateCandidate = useCallback(async (id, fields) => {
    let previous
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        previous = c
        return { ...c, ...fields }
      }),
    )

    try {
      const updated = await apiUpdateCandidate(id, fields)
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return updated
    } catch (err) {
      setError(err.message)
      if (previous) {
        setCandidates((prev) => prev.map((c) => (c.id === id ? previous : c)))
      }
      throw err
    }
  }, [])

  const moveCandidate = useCallback(
    (id, status) => updateCandidate(id, { status }),
    [updateCandidate],
  )

  const uploadResume = useCallback(async (id, file) => {
    try {
      const updated = await uploadCandidateResume(id, file)
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteCandidate = useCallback(async (id) => {
    let previous
    let previousIndex = -1
    setCandidates((prev) => {
      previousIndex = prev.findIndex((c) => c.id === id)
      previous = prev[previousIndex]
      return prev.filter((c) => c.id !== id)
    })

    try {
      await apiDeleteCandidate(id)
    } catch (err) {
      setError(err.message)
      if (previous) {
        setCandidates((prev) => {
          const next = [...prev]
          next.splice(previousIndex, 0, previous)
          return next
        })
      }
      throw err
    }
  }, [])

  return {
    candidates,
    loading,
    error,
    clearError: () => setError(null),
    isLive,
    addCandidate,
    updateCandidate,
    moveCandidate,
    uploadResume,
    deleteCandidate,
  }
}
