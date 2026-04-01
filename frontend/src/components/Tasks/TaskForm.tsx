import { useState } from 'react'
import { format } from 'date-fns'
import type { Task } from '../../types'
import Button from '../Common/Button'

interface TaskFormProps {
  initialData?: Partial<Task>
  defaultDate?: Date
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export default function TaskForm({ initialData, defaultDate, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [date, setDate] = useState(
    initialData?.date
      ? format(new Date(initialData.date), 'yyyy-MM-dd')
      : format(defaultDate ?? new Date(), 'yyyy-MM-dd')
  )
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialData?.priority ?? 'medium')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [timeEstimate, setTimeEstimate] = useState(String(initialData?.timeEstimate ?? ''))
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false)
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>(initialData?.recurringType ?? 'daily')
  const [plannedFor, setPlannedFor] = useState(
    initialData?.plannedFor ? format(new Date(initialData.plannedFor), 'yyyy-MM-dd') : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required')
    setError('')
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        date,
        priority,
        category: category.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim(),
        timeEstimate: timeEstimate ? Number(timeEstimate) : undefined,
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
        plannedFor: plannedFor || undefined,
      }
      await onSubmit(payload)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save task'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500'

  const labelClass = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className={inputClass} required />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={2} className={`${inputClass} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')} className={inputClass}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="work, personal..." className={inputClass} list="categories" />
          <datalist id="categories">
            {['Work', 'Personal', 'Health', 'Learning', 'Finance'].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Time estimate (min)</label>
          <input type="number" value={timeEstimate} onChange={(e) => setTimeEstimate(e.target.value)} placeholder="30" min="0" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, tag3" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." rows={2} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className={labelClass}>Plan for date (night planning)</label>
        <input type="date" value={plannedFor} onChange={(e) => setPlannedFor(e.target.value)} className={inputClass} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Recurring task
        </label>
        {isRecurring && (
          <select value={recurringType} onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly')} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?._id ? 'Save changes' : 'Create task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
