import { useEffect, useState } from 'react'
import { stats } from '../../utils/api'
import type { ProductivityInsights } from '../../types'

const INSIGHT_CARDS = [
  {
    key: 'averageCompletionRate' as const,
    label: 'Avg. completion rate',
    icon: '📈',
    format: (v: number) => `${Math.round(v)}%`,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    key: 'mostProductiveDay' as const,
    label: 'Most productive day',
    icon: '🌟',
    format: (v: string | number) => String(v),
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    key: 'totalTasksCompleted' as const,
    label: 'Tasks (last 30 days)',
    icon: '🏆',
    format: (v: number) => String(v),
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    key: 'currentStreak' as const,
    label: 'Current streak',
    icon: '🔥',
    format: (v: number) => `${v} day${v !== 1 ? 's' : ''}`,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
]

export default function ProductivityInsights() {
  const [data, setData] = useState<ProductivityInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stats
      .insights()
      .then((res) => setData(res.data.insights ?? res.data))
      .catch(() =>
        setData({
          averageCompletionRate: 0,
          mostProductiveDay: '—',
          totalTasksCompleted: 0,
          currentStreak: 0,
        })
      )
      .finally(() => setLoading(false))
  }, [])

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
    <div>
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        Productivity Insights
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {INSIGHT_CARDS.map(({ key, label, icon, format, color, bg }) => {
          const value = data?.[key] ?? 0
          return (
            <div key={key} className={`rounded-2xl ${bg} p-5 transition hover:shadow-md`}>
              <div className="mb-3 text-2xl">{icon}</div>
              <div className={`text-2xl font-bold ${color}`}>{format(value as never)}</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
