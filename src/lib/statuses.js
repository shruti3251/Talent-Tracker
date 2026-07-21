export const STATUSES = [
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    header: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-500',
    dot: 'bg-blue-500',
    ring: 'focus:ring-blue-500',
  },
  {
    key: 'interview_scheduled',
    label: 'Interview Scheduled',
    header: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-500',
    dot: 'bg-purple-500',
    ring: 'focus:ring-purple-500',
  },
  {
    key: 'interviewed',
    label: 'Interviewed',
    header: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-500',
    dot: 'bg-orange-500',
    ring: 'focus:ring-orange-500',
  },
  {
    key: 'selected',
    label: 'Selected',
    header: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-500',
    dot: 'bg-green-500',
    ring: 'focus:ring-green-500',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    header: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-500',
    dot: 'bg-red-500',
    ring: 'focus:ring-red-500',
  },
]

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s]))

export const DEFAULT_STATUS = STATUSES[0].key
