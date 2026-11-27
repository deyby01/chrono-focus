import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActiveView,
  Category,
  CreateCategoryPayload,
  CreateTaskPayload,
  DailyResume,
  LogSessionPayload,
  PerformanceMetrics,
  Task,
} from '../models/types';
import { apiClient } from '../services/apiClient';
import { getLocalDateString } from '../utils/timeFormatters';

/**
 * Picks the task that should be loaded into the reverse chronometer, preferring
 * (in order): the currently active task, a timer persisted in localStorage, an
 * in-progress task, a pending task, then any task for the day.
 */
function resolveActiveTask(prev: Task | null, schedule: Task[], tasks: Task[]): Task | null {
  if (prev) {
    const refreshed =
      schedule.find((t) => t.id === prev.id) || tasks.find((t) => t.id === prev.id);
    return refreshed || prev;
  }

  try {
    const savedRaw = localStorage.getItem('chronofocus_active_timer_v1');
    if (savedRaw) {
      const saved = JSON.parse(savedRaw) as { taskId?: number };
      if (saved.taskId) {
        const persistedTask =
          schedule.find((t) => t.id === saved.taskId) ||
          tasks.find((t) => t.id === saved.taskId);
        if (persistedTask) return persistedTask;
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }

  return (
    schedule.find((t) => t.status === 'in_progress') ||
    schedule.find((t) => t.status === 'pending') ||
    schedule[0] ||
    tasks[0] ||
    null
  );
}

export function useWorkspaceController() {
  const [activeView, setActiveView] = useState<ActiveView>('focus');
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [categories, setCategories] = useState<Category[]>([]);
  // Raw tasks for the selected date as returned by the server. Client-side
  // filtering (category/status/search) is derived from this list via useMemo,
  // so changing a filter never triggers a network request.
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [dailyResume, setDailyResume] = useState<DailyResume | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Loads the date-scoped workspace data (categories, tasks, daily resume) in a
   * single parallel batch. Only depends on `selectedDate`, so filter and search
   * changes do not hit the API.
   */
  const fetchWorkspace = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [catsData, tasksData, resumeData] = await Promise.all([
          apiClient.getCategories(selectedDate),
          apiClient.getTasks({ date: selectedDate }),
          apiClient.getDailyResume(selectedDate),
        ]);

        setCategories(catsData);
        setAllTasks(tasksData);
        setDailyResume(resumeData);
        setActiveTask((prev) => resolveActiveTask(prev, resumeData.schedule, tasksData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to connect to ChronoFocus API');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedDate]
  );

  /**
   * Loads the global performance metrics. These are independent of the selected
   * date and filters, so they are fetched separately and only refreshed when a
   * mutation can actually change them.
   */
  const fetchPerformance = useCallback(async () => {
    try {
      const perfData = await apiClient.getPerformanceMetrics();
      setPerformance(perfData);
    } catch {
      // Performance metrics are non-critical; keep the previous snapshot on error.
    }
  }, []);

  useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  useEffect(() => {
    void fetchPerformance();
  }, [fetchPerformance]);

  /**
   * Tasks filtered on the client by category, status, and free-text search.
   * Derived from `allTasks`, so typing in the search box or switching filters
   * never triggers a network request.
   */
  const tasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allTasks.filter((task) => {
      if (categoryFilter && task.category_id !== categoryFilter) return false;
      if (statusFilter && task.status !== statusFilter) return false;
      if (query) {
        const haystack = `${task.title} ${task.description} ${task.category_name}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [allTasks, categoryFilter, statusFilter, searchQuery]);

  /** Refreshes date-scoped data and performance metrics after a mutation. */
  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([fetchWorkspace(true), fetchPerformance()]);
  }, [fetchWorkspace, fetchPerformance]);

  const createTask = async (payload: CreateTaskPayload) => {
    const created = await apiClient.createTask(payload);
    await refreshAfterMutation();
    setActiveTask((prev) => prev ?? created);
    return created;
  };

  const updateTask = async (id: number, payload: Partial<Task>) => {
    const updated = await apiClient.updateTask(id, payload);
    await refreshAfterMutation();
    setActiveTask((prev) => (prev?.id === id ? updated : prev));
    return updated;
  };

  const deleteTask = async (id: number) => {
    await apiClient.deleteTask(id);
    if (activeTask?.id === id) {
      setActiveTask(null);
    }
    await refreshAfterMutation();
  };

  const toggleChecklistItem = async (task: Task, itemId: string) => {
    const nextChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    await updateTask(task.id, { checklist: nextChecklist });
  };

  const createCategory = async (payload: CreateCategoryPayload) => {
    const created = await apiClient.createCategory(payload);
    await fetchWorkspace(true);
    return created;
  };

  const updateCategory = async (id: number, payload: Partial<CreateCategoryPayload>) => {
    const updated = await apiClient.updateCategory(id, payload);
    await fetchWorkspace(true);
    return updated;
  };

  const deleteCategory = async (id: number) => {
    await apiClient.deleteCategory(id);
    await fetchWorkspace(true);
  };

  const logFocusSession = async (payload: LogSessionPayload) => {
    await apiClient.logSession(payload);
    await refreshAfterMutation();
  };

  const deleteFocusSession = async (id: number) => {
    await apiClient.deleteSession(id);
    await refreshAfterMutation();
  };

  const launchTaskInChronometer = (task: Task) => {
    setActiveTask(task);
    setActiveView('focus');
  };

  return {
    activeView,
    setActiveView,
    selectedDate,
    setSelectedDate,
    categories,
    tasks,
    dailyResume,
    performance,
    activeTask,
    setActiveTask,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    refresh: () => fetchWorkspace(false),
    createTask,
    updateTask,
    deleteTask,
    toggleChecklistItem,
    createCategory,
    updateCategory,
    deleteCategory,
    logFocusSession,
    deleteFocusSession,
    launchTaskInChronometer,
  };
}
