import { useState, useMemo } from 'react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { useTask } from '../context/TaskContext'
import TaskList from '../components/Tasks/TaskList'
import TaskFilter from '../components/Tasks/TaskFilter'
import TaskForm from '../components/Tasks/TaskForm'
import Modal from '../components/Common/Modal'
import Button from '../components/Common/Button'
import type { Task } from '../types'

interface FilterState {
  search: string
  priority: string
  category: string
  status: string
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: 'all',
  category: 'all',
  status: 'all',
}

export default function TasksPage() {
  const { tasks, loading, selectedDate, setSelectedDate, toggleComplete, updateTask, deleteTask, reorderTasks, createTask } = useTask()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dateInput, setDateInput] = useState('')

  const categories = useMemo(
    () => [...new Set(tasks.map((t) => t.category).filter(Boolean))] as string[],
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.category !== 'all' && task.category !== filters.category) return false
      if (filters.status === 'active' && task.completed) return false
      if (filters.status === 'completed' && !task.completed) return false
      return true
    })
  }, [tasks, filters])

  async function handleCreate(data: Record<string, unknown>) {
    await createTask({ ...data, date: format(selectedDate, 'yyyy-MM-dd') })
    setShowAddModal(false)
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editingTask) return
    await updateTask(editingTask._id, data)
    setEditingTask(null)
  }

  function goToPrevDay() {
    setSelectedDate(subDays(selectedDate, 1))
  }

  function goToNextDay() {
    setSelectedDate(addDays(selectedDate, 1))
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <Button onClick={() => setShowAddModal(true)}>
            + Add Task
          </Button>
        </div>

        {/* Date Navigator */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={goToPrevDay}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Previous day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              {isToday(selectedDate) && (
                <p className="text-xs text-primary-600 dark:text-primary-400">Today</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateInput || format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  setDateInput(e.target.value)
                  if (e.target.value) setSelectedDate(new Date(e.target.value + 'T00:00:00'))
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {!isToday(selectedDate) && (
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Today
                </Button>
              )}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Next day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilter
            filters={filters}
            onChange={setFilters}
            totalCount={tasks.length}
            filteredCount={filteredTasks.length}
            categories={categories}
          />
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          loading={loading}
          onToggle={toggleComplete}
          onEdit={(t) => setEditingTask(t)}
          onDelete={deleteTask}
          onReorder={reorderTasks}
        />
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 active:scale-95 sm:hidden"
        aria-label="Add task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Task">
        <TaskForm
          defaultDate={selectedDate}
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <TaskForm
            initialData={editingTask}
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>
    </div>
  )
}
