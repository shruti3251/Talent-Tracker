import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { DEFAULT_STATUS } from '../lib/statuses'

export function useCandidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCandidates(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        (payload) => {
          setCandidates((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((c) => c.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((c) => c.id !== payload.old.id)
            }
            return prev
          })
        },
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const addCandidate = useCallback(async (fields) => {
    const { data, error: insertError } = await supabase
      .from('candidates')
      .insert([{ ...fields, status: DEFAULT_STATUS }])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      throw insertError
    }

    setCandidates((prev) => (prev.some((c) => c.id === data.id) ? prev : [data, ...prev]))
    return data
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

    const { data, error: updateError } = await supabase
      .from('candidates')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      if (previous) {
        setCandidates((prev) => prev.map((c) => (c.id === id ? previous : c)))
      }
      throw updateError
    }

    setCandidates((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }, [])

  const moveCandidate = useCallback(
    (id, status) => updateCandidate(id, { status }),
    [updateCandidate],
  )

  const deleteCandidate = useCallback(async (id) => {
    let previous
    let previousIndex = -1
    setCandidates((prev) => {
      previousIndex = prev.findIndex((c) => c.id === id)
      previous = prev[previousIndex]
      return prev.filter((c) => c.id !== id)
    })

    const { error: deleteError } = await supabase.from('candidates').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      if (previous) {
        setCandidates((prev) => {
          const next = [...prev]
          next.splice(previousIndex, 0, previous)
          return next
        })
      }
      throw deleteError
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
    deleteCandidate,
  }
}
