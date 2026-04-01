import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { stats } from '../../utils/api'
import type { DailyStats } from '../../types'
import { getCompletionRate } from '../../utils/helpers'

const STAT_CARDS = [
  {
    key: 'total' as const,
    label: "Today's tasks",
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key: 'completed' as const,
    label: 'Completed',
    icon: '✅',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    key: 'pending' as const,
    label: 'Pending',
    icon: '⏳',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
]

function CircularProgress({ rate }: { rate: number }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (rate / 100) * circ

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-700" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        strokeWidth="6"
        stroke="url(#progressGrad)"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <text x="28" y="33" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-xs font-semibold" fontSize="11" fontWeight="600">
        {rate}%
      </text>
    </svg>
  )
}

export default function DashboardStats() {
  const [data, setData] = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stats
      .daily(format(new Date(), 'yyyy-MM-dd'))
      .then((res) => setData(res.data.stats ?? res.data))
      .catch(() => setData({ date: '', total: 0, completed: 0, pending: 0, completionRate: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const rate = data ? getCompletionRate(data.completed, data.total) : 0

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STAT_CARDS.map(({ key, label, icon, bg }) => (
        <div key={key} className={`rounded-2xl ${bg} p-5 transition hover:shadow-md`}>
          <div className="mb-3 text-2xl">{icon}</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{data?.[key] ?? 0}</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      ))}

      {/* Completion rate */}
      <div className="rounded-2xl bg-primary-50 p-5 dark:bg-primary-900/20 transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{rate}%</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Completion rate</div>
          </div>
          <CircularProgress rate={rate} />
        </div>
      </div>
    </div>
  )
}
