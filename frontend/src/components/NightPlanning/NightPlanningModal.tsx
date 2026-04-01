import { useState } from 'react'
import { format, addDays } from 'date-fns'
import Modal from '../Common/Modal'
import Button from '../Common/Button'
import { useTask } from '../../context/TaskContext'
import { getPriorityBadgeColor } from '../../utils/helpers'
import type { Task } from '../../types'

interface NightPlanningModalProps {
  isOpen: boolean
  onClose: () => void
}

type PlanItem = { title: string; priority: 'high' | 'medium' | 'low' }

export default function NightPlanningModal({ isOpen, onClose }: NightPlanningModalProps) {
  const { tasks, createTask } = useTask()
  const tomorrow = addDays(new Date(), 1)
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
  const tomorrowLabel = format(tomorrow, 'EEEE, MMMM d')

  const incompleteToday = tasks.filter((t) => !t.completed)

  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [plannedItems, setPlannedItems] = useState<PlanItem[]>([])
  const [carryForward, setCarryForward] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addItem() {
    if (!newTitle.trim()) return
    setPlannedItems((prev) => [...prev, { title: newTitle.trim(), priority: newPriority }])
    setNewTitle('')
    setNewPriority('medium')
  }

  function removeItem(i: number) {
    setPlannedItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function toggleCarry(id: string) {
    setCarryForward((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const carried = incompleteToday.filter((t) => carryForward.has(t._id))
      const toCreate: { title: string; priority: 'high' | 'medium' | 'low'; date: string; plannedFor?: string }[] = [
        ...carried.map((t: Task) => ({ title: t.title, priority: t.priority, date: tomorrowStr, plannedFor: tomorrowStr })),
        ...plannedItems.map((p) => ({ ...p, date: tomorrowStr, plannedFor: tomorrowStr })),
      ]
      await Promise.all(toCreate.map((item) => createTask(item as Record<string, unknown>)))
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Plan for ${tomorrowLabel}`} maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Carry forward incomplete tasks */}
        {incompleteToday.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Carry forward today's incomplete tasks
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {incompleteToday.map((t) => (
                <label key={t._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={carryForward.has(t._id)}
                    onChange={() => toggleCarry(t._id)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{t.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityBadgeColor(t.priority)}`}>
                    {t.priority}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Add new tasks */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Add new tasks for tomorrow
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Task title..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Med</option>
              <option value="low">🔵 Low</option>
            </select>
            <Button type="button" size="sm" onClick={addItem}>
              Add
            </Button>
          </div>

          {plannedItems.length > 0 && (
            <div className="mt-3 space-y-2">
              {plannedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{item.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityBadgeColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {carryForward.size + plannedItems.length} task{carryForward.size + plannedItems.length !== 1 ? 's' : ''} planned for tomorrow
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={carryForward.size + plannedItems.length === 0}
            >
              {saved ? '✓ Saved!' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
