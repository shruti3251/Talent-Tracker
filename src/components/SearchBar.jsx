import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, shownCount, totalCount }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search candidates by name..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <span className="text-sm text-slate-500 whitespace-nowrap">
        {shownCount} shown{value ? ` of ${totalCount}` : ''}
      </span>
    </div>
  )
}
