import { useState } from 'react'
import { LayoutGrid, List, Plus, Settings, Users } from 'lucide-react'
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

          <span
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            title={isLive ? 'Auto-refreshing every few seconds' : 'Cannot reach the API server'}
          >
            <span
              className={`size-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}
            />
            {isLive ? 'Auto-refresh' : 'Offline'}
          </span>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('expanded')}
              title="Expanded view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'expanded'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="size-4" />
              Expanded
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('compact')}
              title="Compact view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'compact'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="size-4" />
              Compact
            </button>
          </div>

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
