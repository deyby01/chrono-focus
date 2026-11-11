import {
  Category,
  CreateCategoryPayload,
  CreateTaskPayload,
  DailyResume,
  FocusSession,
  LogSessionPayload,
  PerformanceMetrics,
  Task,
} from '../models/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || payload.status === 'error') {
    throw new Error(payload.message || `API request failed (${response.status})`);
  }

  return payload.data;
}

export const apiClient = {
  getCategories: (date?: string) =>
    request<Category[]>(`/categories${date ? `?date=${encodeURIComponent(date)}` : ''}`),

  createCategory: (data: CreateCategoryPayload) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: number, data: Partial<CreateCategoryPayload>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: number) =>
    request<{ id: number; deleted: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  getTasks: (filters?: {
    date?: string;
    categoryId?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  createTask: (data: CreateTaskPayload) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: number, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    request<{ id: number; deleted: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  getSessions: (filters?: { date?: string; taskId?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.taskId) params.set('taskId', String(filters.taskId));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return request<FocusSession[]>(`/sessions${qs ? `?${qs}` : ''}`);
  },

  logSession: (data: LogSessionPayload) =>
    request<{ session: FocusSession; task: Task }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSession: (id: number) =>
    request<{ id: number; deleted: boolean }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  getDailyResume: (date?: string) =>
    request<DailyResume>(`/analytics/daily-resume${date ? `?date=${encodeURIComponent(date)}` : ''}`),

  getPerformanceMetrics: () => request<PerformanceMetrics>('/analytics/performance'),
};

