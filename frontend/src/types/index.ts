export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  completed: boolean;
  completedAt?: string;
  order: number;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  plannedFor?: string;
  notes?: string;
  timeEstimate?: number;
  timeSpent?: number;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface WeeklyStats {
  date: string;
  day: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface ProductivityInsights {
  averageCompletionRate: number;
  mostProductiveDay: string;
  totalTasksCompleted: number;
  currentStreak: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
