import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, shownCount, totalCount }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search candidates by name..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900"
        />
      </div>
      <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {shownCount} shown{value ? ` of ${totalCount}` : ''}
      </span>
    </div>
  )
}
