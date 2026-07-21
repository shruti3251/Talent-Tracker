import { DragDropContext } from '@hello-pangea/dnd'
import { STATUSES } from '../lib/statuses'
import Column from './Column'

export default function Board({ candidates, viewMode, onEdit, onDelete, onMove }) {
  function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    if (destination.droppableId === source.droppableId) return
    onMove(draggableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {STATUSES.map((status) => (
          <Column
            key={status.key}
            status={status}
            candidates={candidates.filter((c) => c.status === status.key)}
            viewMode={viewMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
