import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useCandidates } from './hooks/useCandidates'
import { useDarkMode } from './hooks/useDarkMode'
import TopBar from './components/TopBar'
import SearchBar from './components/SearchBar'
import Board from './components/Board'
import AddCandidateModal from './components/AddCandidateModal'
import EditCandidateModal from './components/EditCandidateModal'

function App() {
  const {
    candidates,
    loading,
    error,
    clearError,
    isLive,
    addCandidate,
    updateCandidate,
    moveCandidate,
    deleteCandidate,
  } = useCandidates()

  const [darkMode, setDarkMode] = useDarkMode()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('expanded')
  const [addOpen, setAddOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return candidates
    return candidates.filter((c) => c.name?.toLowerCase().includes(term))
  }, [candidates, search])

  async function handleDelete(candidate) {
    const confirmed = window.confirm(
      `Delete ${candidate.name}? This action cannot be undone.`,
    )
    if (!confirmed) return
    try {
      await deleteCandidate(candidate.id)
    } catch {
      // error surfaced via the error banner
    }
  }

  async function handleMove(id, status) {
    try {
      await moveCandidate(id, status)
    } catch {
      // error surfaced via the error banner
    }
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar
        totalCount={candidates.length}
        isLive={isLive}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => setAddOpen(true)}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        shownCount={filteredCandidates.length}
        totalCount={candidates.length}
      />

      {error && (
        <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-6 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </span>
          <button type="button" onClick={clearError} aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-400 dark:text-slate-600">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : (
        <Board
          candidates={filteredCandidates}
          viewMode={viewMode}
          onEdit={setEditingCandidate}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      )}

      {addOpen && (
        <AddCandidateModal onAdd={addCandidate} onClose={() => setAddOpen(false)} />
      )}

      {editingCandidate && (
        <EditCandidateModal
          candidate={editingCandidate}
          onSave={updateCandidate}
          onClose={() => setEditingCandidate(null)}
        />
      )}
    </div>
  )
}

export default App
