import { useState } from 'react'
import { Moon, Plus, Settings, Sun, Users } from 'lucide-react'

export default function TopBar({
  totalCount,
  isLive,
  viewMode,
  onViewModeChange,
  onAddClick,
  darkMode,
  onDarkModeChange,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
              TalentFlow
            </h1>
            <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
              HR Candidate Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            Total: {totalCount}
          </span>

          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
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
              className={`text-sm font-medium ${
                viewMode === 'expanded'
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              Expanded
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                viewMode === 'compact' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                  viewMode === 'compact' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </span>
            <span
              className={`text-sm font-medium ${
                viewMode === 'compact'
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
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
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Settings className="size-4" />
            </button>

            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-600 dark:bg-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Settings
                  </h3>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      {darkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
                      Dark Mode
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={darkMode}
                      onClick={() => onDarkModeChange((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
