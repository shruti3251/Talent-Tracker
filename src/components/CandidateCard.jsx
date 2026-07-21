import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import {
  ArrowRightLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Hourglass,
  IndianRupee,
  MoreVertical,
  Pencil,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { AVAILABILITY_LABEL } from '../lib/availability'
import { STATUSES, STATUS_MAP } from '../lib/statuses'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CandidateCard({ candidate, index, viewMode, onEdit, onDelete, onMove }) {
  const compact = viewMode === 'compact'
  const [expanded, setExpanded] = useState(!compact)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveMenuOpen, setMoveMenuOpen] = useState(false)

  const status = STATUS_MAP[candidate.status]
  const showDetails = expanded

  function closeMenus() {
    setMenuOpen(false)
    setMoveMenuOpen(false)
  }

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group rounded-lg border-l-4 ${status?.border ?? 'border-slate-300'} border border-slate-200 bg-white shadow-sm ${
            snapshot.isDragging ? 'ring-2 ring-indigo-300 shadow-lg' : ''
          }`}
        >
          <div className="flex items-center gap-1 px-3 py-2.5">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex size-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex-1 truncate text-left text-sm font-bold uppercase tracking-wide text-slate-800"
            >
              {candidate.name}
            </button>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Candidate actions"
              >
                <MoreVertical className="size-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeMenus} />
                  <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        closeMenus()
                        onEdit(candidate)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setMoveMenuOpen((v) => !v)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowRightLeft className="size-3.5" /> Move to stage
                    </button>
                    {moveMenuOpen && (
                      <div className="border-t border-slate-100 py-1">
                        {STATUSES.filter((s) => s.key !== candidate.status).map((s) => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => {
                              closeMenus()
                              onMove(candidate.id, s.key)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 pl-8 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            <span className={`size-2 rounded-full ${s.dot}`} />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        closeMenus()
                        onDelete(candidate)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {showDetails && (
            <div className="space-y-1.5 border-t border-slate-100 px-3 py-2.5 text-xs text-slate-600">
              {(candidate.current_ctc != null || candidate.expected_ctc != null) && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="size-3.5 shrink-0 text-slate-400" />
                  {candidate.current_ctc != null ? `${candidate.current_ctc} LPA current` : '— current'}
                  {' → '}
                  {candidate.expected_ctc != null ? `${candidate.expected_ctc} LPA expected` : '— expected'}
                </div>
              )}
              {candidate.experience_yrs != null && (
                <div className="flex items-center gap-2">
                  <Hourglass className="size-3.5 shrink-0 text-slate-400" /> {candidate.experience_yrs} yrs experience
                </div>
              )}
              {candidate.availability && (
                <div className="flex items-center gap-2">
                  <Clock3 className="size-3.5 shrink-0 text-slate-400" />
                  Available: {AVAILABILITY_LABEL[candidate.availability] ?? candidate.availability}
                </div>
              )}
              {candidate.notes && (
                <div className="flex items-start gap-2">
                  <StickyNote className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span className="whitespace-pre-wrap">{candidate.notes}</span>
                </div>
              )}
              {candidate.resume_url && (
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:underline"
                >
                  <FileText className="size-3.5 shrink-0" /> View resume
                </a>
              )}
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <Calendar className="size-3.5 shrink-0" /> Added {formatDate(candidate.created_at)}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
