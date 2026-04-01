import { useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import DashboardStats from '../components/Dashboard/DashboardStats'
import WeeklyChart from '../components/Dashboard/WeeklyChart'
import ProductivityInsights from '../components/Dashboard/ProductivityInsights'
import TaskList from '../components/Tasks/TaskList'
import TaskForm from '../components/Tasks/TaskForm'
import Modal from '../components/Common/Modal'
import NightPlanningModal from '../components/NightPlanning/NightPlanningModal'
import Button from '../components/Common/Button'

function getGreeting(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}! 🌅`
  if (hour < 17) return `Good afternoon, ${name}! ☀️`
  return `Good evening, ${name}! 🌙`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, loading, toggleComplete, updateTask, deleteTask, reorderTasks, createTask } = useTask()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<(typeof tasks)[0] | null>(null)
  const [showNightPlanning, setShowNightPlanning] = useState(false)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayTasks = tasks.filter((t) => t.date?.startsWith(todayStr))

  async function handleCreate(data: Record<string, unknown>) {
    await createTask({ ...data, date: todayStr })
    setShowAddModal(false)
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editingTask) return
    await updateTask(editingTask._id, data)
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user ? getGreeting(user.name.split(' ')[0]) : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowNightPlanning(true)}
              size="sm"
            >
              🌙 Plan Tomorrow
            </Button>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              + Add Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Chart + Insights */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <WeeklyChart />
          <div className="flex flex-col justify-center">
            <ProductivityInsights />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Today's Tasks
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {todayTasks.filter((t) => !t.completed).length} pending
              </span>
            </h2>
          </div>
          <TaskList
            tasks={todayTasks}
            loading={loading}
            onToggle={toggleComplete}
            onEdit={(t) => setEditingTask(t)}
            onDelete={deleteTask}
            onReorder={reorderTasks}
          />
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Task">
        <TaskForm
          defaultDate={today}
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

      {/* Night Planning Modal */}
      <NightPlanningModal isOpen={showNightPlanning} onClose={() => setShowNightPlanning(false)} />
    </div>
  )
}
