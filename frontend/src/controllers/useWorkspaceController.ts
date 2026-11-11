import { useState, useEffect, useCallback } from 'react';
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

export function useWorkspaceController() {
  const [activeView, setActiveView] = useState<ActiveView>('focus');
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyResume, setDailyResume] = useState<DailyResume | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAllData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [catsData, tasksData, resumeData, perfData] = await Promise.all([
          apiClient.getCategories(selectedDate),
          apiClient.getTasks({
            date: activeView === 'schedule' && !selectedDate ? undefined : selectedDate,
            categoryId: categoryFilter,
            status: statusFilter || undefined,
            search: searchQuery || undefined,
          }),
          apiClient.getDailyResume(selectedDate),
          apiClient.getPerformanceMetrics(),
        ]);

        setCategories(catsData);
        setTasks(tasksData);
        setDailyResume(resumeData);
        setPerformance(perfData);

        setActiveTask((prev) => {
          if (prev) {
            const refreshed =
              resumeData.schedule.find((t) => t.id === prev.id) ||
              tasksData.find((t) => t.id === prev.id);
            return refreshed || prev;
          }
          try {
            const savedRaw = localStorage.getItem('chronofocus_active_timer_v1');
            if (savedRaw) {
              const saved = JSON.parse(savedRaw) as { taskId?: number };
              if (saved.taskId) {
                const persistedTask =
                  resumeData.schedule.find((t) => t.id === saved.taskId) ||
                  tasksData.find((t) => t.id === saved.taskId);
                if (persistedTask) return persistedTask;
              }
            }
          } catch {
            // Ignore localStorage parse errors
          }
          const nextInProgress = resumeData.schedule.find((t) => t.status === 'in_progress');
          if (nextInProgress) return nextInProgress;
          const nextPending = resumeData.schedule.find((t) => t.status === 'pending');
          if (nextPending) return nextPending;
          return resumeData.schedule[0] || tasksData[0] || null;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to connect to ChronoFocus API');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedDate, activeView, categoryFilter, statusFilter, searchQuery]
  );

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const createTask = async (payload: CreateTaskPayload) => {
    const created = await apiClient.createTask(payload);
    await fetchAllData(true);
    setActiveTask((prev) => prev ?? created);
    return created;
  };

  const updateTask = async (id: number, payload: Partial<Task>) => {
    const updated = await apiClient.updateTask(id, payload);
    await fetchAllData(true);
    setActiveTask((prev) => (prev?.id === id ? updated : prev));
    return updated;
  };

  const deleteTask = async (id: number) => {
    await apiClient.deleteTask(id);
    if (activeTask?.id === id) {
      setActiveTask(null);
    }
    await fetchAllData(true);
  };

  const toggleChecklistItem = async (task: Task, itemId: string) => {
    const nextChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    await updateTask(task.id, { checklist: nextChecklist });
  };

  const createCategory = async (payload: CreateCategoryPayload) => {
    const created = await apiClient.createCategory(payload);
    await fetchAllData(true);
    return created;
  };

  const updateCategory = async (id: number, payload: Partial<CreateCategoryPayload>) => {
    const updated = await apiClient.updateCategory(id, payload);
    await fetchAllData(true);
    return updated;
  };

  const deleteCategory = async (id: number) => {
    await apiClient.deleteCategory(id);
    await fetchAllData(true);
  };

  const logFocusSession = async (payload: LogSessionPayload) => {
    await apiClient.logSession(payload);
    await fetchAllData(true);
  };

  const deleteFocusSession = async (id: number) => {
    await apiClient.deleteSession(id);
    await fetchAllData(true);
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
    refresh: () => fetchAllData(false),
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
