export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type ActiveView = 'focus' | 'schedule' | 'categories' | 'analytics';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  daily_target_minutes: number;
  created_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  total_spent_seconds?: number;
  today_spent_seconds?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  category_color: string;
  category_icon: string;
  priority: TaskPriority;
  status: TaskStatus;
  planned_duration_minutes: number;
  actual_duration_seconds: number;
  scheduled_date: string;
  scheduled_start_time: string | null;
  checklist: ChecklistItem[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: number;
  task_id: number;
  task_title: string;
  planned_duration_minutes: number;
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string;
  planned_seconds: number;
  duration_seconds: number;
  completed_countdown: boolean;
  notes: string;
  started_at: string;
  ended_at: string;
}

export interface CategoryBreakdownItem {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  daily_target_minutes: number;
  tasks_count: number;
  completed_count: number;
  planned_seconds: number;
  focused_seconds: number;
}

export interface DailyResume {
  date: string;
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
    plannedSeconds: number;
    focusedSeconds: number;
    sessionsCount: number;
    longestSessionTodaySeconds: number;
  };
  categoryBreakdown: CategoryBreakdownItem[];
  schedule: Task[];
  sessions: FocusSession[];
}

export interface PerformanceMetrics {
  bestSession: {
    id: number;
    duration_seconds: number;
    planned_seconds: number;
    started_at: string;
    task_title: string;
    category_name: string;
    category_color: string;
  } | null;
  bestDay: {
    date: string;
    total_seconds: number;
    sessions_count: number;
  } | null;
  peakProductivityHour: {
    hour: number;
    formattedRange: string;
    totalSeconds: number;
    sessionsCount: number;
  } | null;
  overall: {
    total_focused_seconds: number;
    completed_tasks_focused_seconds: number;
    total_tasks_completed: number;
    total_tasks_created: number;
    total_sessions: number;
    average_session_seconds: number;
  };
  weeklyActivity: Array<{
    date: string;
    day_label: string;
    focused_seconds: number;
    tasks_completed: number;
  }>;
  categoryTotals: Array<{
    id: number;
    name: string;
    color: string;
    icon: string;
    total_tasks: number;
    completed_tasks: number;
    total_seconds: number;
  }>;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  category_id: number;
  priority: TaskPriority;
  status?: TaskStatus;
  planned_duration_minutes: number;
  scheduled_date: string;
  scheduled_start_time?: string | null;
  checklist?: ChecklistItem[];
}

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon: string;
  description: string;
  daily_target_minutes: number;
}

export interface LogSessionPayload {
  task_id: number;
  planned_seconds: number;
  duration_seconds: number;
  completed_countdown: boolean;
  notes?: string;
  started_at?: string;
  ended_at?: string;
  mark_task_completed?: boolean;
}

