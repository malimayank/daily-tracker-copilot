import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({ baseURL })

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    axiosInstance.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', data),
  getProfile: () => axiosInstance.get('/auth/me'),
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string }>) =>
    axiosInstance.put('/auth/profile', data),
}

export const tasks = {
  getAll: (params?: Record<string, string | number | boolean | undefined>) =>
    axiosInstance.get('/tasks', { params }),
  getById: (id: string) => axiosInstance.get(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => axiosInstance.post('/tasks', data),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put(`/tasks/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/tasks/${id}`),
  reorder: (taskList: { id: string; order: number }[]) =>
    axiosInstance.put('/tasks/reorder', { tasks: taskList }),
  bulkUpdate: (taskIds: string[], updates: Record<string, unknown>) =>
    axiosInstance.put('/tasks/bulk', { taskIds, updates }),
}

export const stats = {
  daily: (date?: string) => axiosInstance.get('/stats/daily', { params: { date } }),
  weekly: (weekStart?: string) =>
    axiosInstance.get('/stats/weekly', { params: { weekStart } }),
  insights: () => axiosInstance.get('/stats/insights'),
}

export default axiosInstance
