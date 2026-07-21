import { Droppable } from '@hello-pangea/dnd'
import { Mailbox } from 'lucide-react'
import CandidateCard from './CandidateCard'

export default function Column({ status, candidates, viewMode, onEdit, onDelete, onMove }) {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50">
      <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 text-white ${status.header}`}>
        <h2 className="text-sm font-semibold">{status.label}</h2>
        <span className="flex min-w-6 items-center justify-center rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
          {candidates.length}
        </span>
      </div>

      <Droppable droppableId={status.key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[140px] flex-1 space-y-2 overflow-y-auto p-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50' : ''
            }`}
          >
            {candidates.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                <Mailbox className="size-8" />
                <p className="text-xs">No candidates yet</p>
              </div>
            )}
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                viewMode={viewMode}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
