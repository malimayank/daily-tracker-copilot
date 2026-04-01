import {
  format,
  isToday as dateFnsIsToday,
  isTomorrow as dateFnsIsTomorrow,
  startOfWeek,
  parseISO,
} from 'date-fns'

function toDate(date: string | Date): Date {
  if (typeof date === 'string') return parseISO(date)
  return date
}

export function formatDate(date: string | Date): string {
  return format(toDate(date), 'MMMM d, yyyy')
}

export function formatShortDate(date: string | Date): string {
  return format(toDate(date), 'MMM d')
}

export function isToday(date: string | Date): boolean {
  return dateFnsIsToday(toDate(date))
}

export function isTomorrow(date: string | Date): boolean {
  return dateFnsIsTomorrow(toDate(date))
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 dark:text-red-400'
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'low':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-slate-500 dark:text-slate-400'
  }
}

export function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  work: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  personal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  health: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  learning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  finance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category.toLowerCase()] ||
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  )
}

export function getCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
