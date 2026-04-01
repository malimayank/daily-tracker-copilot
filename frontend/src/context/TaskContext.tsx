import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { format } from 'date-fns'
import { tasks as tasksApi } from '../utils/api'
import type { Task } from '../types'

interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  selectedDate: Date
  fetchTasks: (date?: Date) => Promise<void>
  createTask: (data: Record<string, unknown>) => Promise<void>
  updateTask: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (reordered: Task[]) => Promise<void>
  setSelectedDate: (date: Date) => void
  toggleComplete: (id: string) => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const fetchTasks = useCallback(async (date?: Date) => {
    setLoading(true)
    try {
      const d = date ?? selectedDate
      const res = await tasksApi.getAll({ date: format(d, 'yyyy-MM-dd') })
      setTasks(res.data.tasks ?? res.data)
    } catch {
      // Keep existing tasks on error
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchTasks(selectedDate)
  }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const createTask = useCallback(async (data: Record<string, unknown>) => {
    const res = await tasksApi.create(data)
    const created: Task = res.data.task ?? res.data
    setTasks((prev) => [...prev, created])
  }, [])

  const updateTask = useCallback(async (id: string, data: Record<string, unknown>) => {
    const res = await tasksApi.update(id, data)
    const updated: Task = res.data.task ?? res.data
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)))
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id)
    setTasks((prev) => prev.filter((t) => t._id !== id))
  }, [])

  const reorderTasks = useCallback(async (reordered: Task[]) => {
    setTasks(reordered)
    try {
      await tasksApi.reorder(
        reordered.map((t, i) => ({ id: t._id, order: i }))
      )
    } catch {
      // Revert on error would require keeping previous state; ignore for now
    }
  }, [])

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find((t) => t._id === id)
    if (!task) return
    const updated = { completed: !task.completed }
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updated } : t))
    )
    try {
      await tasksApi.update(id, updated)
    } catch {
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: task.completed } : t))
      )
    }
  }, [tasks])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        selectedDate,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        reorderTasks,
        setSelectedDate,
        toggleComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTask must be used within TaskProvider')
  return ctx
}
