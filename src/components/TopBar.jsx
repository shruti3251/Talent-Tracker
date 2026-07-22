import { useState } from 'react'
import { Plus, Settings, Users } from 'lucide-react'
import { STATUSES } from '../lib/statuses'

export default function TopBar({
  totalCount,
  isLive,
  viewMode,
  onViewModeChange,
  onAddClick,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">TalentFlow</h1>
            <p className="text-xs text-slate-500 leading-tight">HR Candidate Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Total: {totalCount}
          </span>

          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            <span
              className={`size-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}
            />
            {isLive ? 'Live' : 'Connecting…'}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={viewMode === 'compact'}
            onClick={() => onViewModeChange(viewMode === 'expanded' ? 'compact' : 'expanded')}
            title={`Switch to ${viewMode === 'expanded' ? 'Compact' : 'Expanded'} view`}
            className="flex items-center gap-2"
          >
            <span
              className={`text-sm font-medium ${viewMode === 'expanded' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Expanded
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                viewMode === 'compact' ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                  viewMode === 'compact' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </span>
            <span
              className={`text-sm font-medium ${viewMode === 'compact' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Compact
            </span>
          </button>

          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            Add Candidate
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              title="Settings"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Settings className="size-4" />
            </button>

            {settingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSettingsOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                  <h3 className="text-sm font-semibold text-slate-900">Pipeline Columns</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Custom fields and column management are coming soon. Current pipeline
                    stages:
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {STATUSES.map((s) => (
                      <li key={s.key} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className={`size-2.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
