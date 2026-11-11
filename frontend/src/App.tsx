import React, { useState } from 'react';
import { Category, CreateCategoryPayload, CreateTaskPayload, Task } from './models/types';
import { useWorkspaceController } from './controllers/useWorkspaceController';
import { useReverseTimerController } from './controllers/useReverseTimerController';
import { formatCountdown } from './utils/timeFormatters';
import { SidebarNav } from './components/SidebarNav';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import { FocusDashboardView } from './views/FocusDashboardView';
import { SchedulePlannerView } from './views/SchedulePlannerView';
import { CategoriesView } from './views/CategoriesView';
import { AnalyticsResumeView } from './views/AnalyticsResumeView';

export const App: React.FC = () => {
  const workspace = useWorkspaceController();

  const timerState = useReverseTimerController({
    activeTask: workspace.activeTask,
    onSessionLogged: workspace.logFocusSession,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<number | undefined>(
    undefined
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenNewTaskModal = (catId?: number) => {
    setEditingTask(null);
    setPreselectedCategoryId(catId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (payload: CreateTaskPayload, taskId?: number) => {
    if (taskId) {
      await workspace.updateTask(taskId, payload);
    } else {
      await workspace.createTask({
        ...payload,
        category_id: preselectedCategoryId || payload.category_id,
      });
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await workspace.updateTask(task.id, { status: nextStatus });
  };

  const handleOpenNewCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (payload: CreateCategoryPayload, categoryId?: number) => {
    if (categoryId) {
      await workspace.updateCategory(categoryId, payload);
    } else {
      await workspace.createCategory(payload);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await workspace.deleteCategory(id);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Cannot delete a category that still has tasks assigned.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row relative selection:bg-emerald-500/30">
      {/* Subtle Ambient Top Shine */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,rgba(16,185,129,0.08),rgba(99,102,241,0.04),transparent)] z-0" />

      <SidebarNav
        activeView={workspace.activeView}
        onSelectView={workspace.setActiveView}
        selectedDate={workspace.selectedDate}
        onSelectDate={workspace.setSelectedDate}
        dailyResume={workspace.dailyResume}
        isTimerRunning={timerState.isRunning}
        timerFormatted={formatCountdown(timerState.remainingSeconds)}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
        onOpenNewCategoryModal={handleOpenNewCategoryModal}
      />

      <main className="flex-1 min-w-0 px-6 py-7 lg:px-10 lg:py-8 max-w-[1440px] w-full mx-auto relative z-10">
        {workspace.error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <span>{workspace.error}</span>
            <button
              type="button"
              className="rounded-lg border border-rose-400/30 bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/30 transition"
              onClick={workspace.refresh}
            >
              Retry Connection
            </button>
          </div>
        )}

        {workspace.activeView === 'focus' && (
          <FocusDashboardView
            selectedDate={workspace.selectedDate}
            dailyResume={workspace.dailyResume}
            performance={workspace.performance}
            activeTask={workspace.activeTask}
            onSelectTask={workspace.setActiveTask}
            timerState={timerState}
            onToggleTaskStatus={(task) => void handleToggleTaskStatus(task)}
            onToggleChecklistItem={workspace.toggleChecklistItem}
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={(id) => void workspace.deleteTask(id)}
            onDeleteSession={(id) => void workspace.deleteFocusSession(id)}
            onOpenNewTaskModal={() => handleOpenNewTaskModal()}
          />
        )}

        {workspace.activeView === 'schedule' && (
          <SchedulePlannerView
            tasks={workspace.tasks}
            categories={workspace.categories}
            selectedDate={workspace.selectedDate}
            onSelectDate={workspace.setSelectedDate}
            categoryFilter={workspace.categoryFilter}
            onChangeCategoryFilter={workspace.setCategoryFilter}
            statusFilter={workspace.statusFilter}
            onChangeStatusFilter={workspace.setStatusFilter}
            searchQuery={workspace.searchQuery}
            onChangeSearchQuery={workspace.setSearchQuery}
            activeTask={workspace.activeTask}
            onLaunchInChronometer={workspace.launchTaskInChronometer}
            onToggleTaskStatus={(task) => void handleToggleTaskStatus(task)}
            onToggleChecklistItem={(task, itemId) =>
              void workspace.toggleChecklistItem(task, itemId)
            }
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={(id) => void workspace.deleteTask(id)}
            onOpenNewTaskModal={() => handleOpenNewTaskModal()}
          />
        )}

        {workspace.activeView === 'categories' && (
          <CategoriesView
            categories={workspace.categories}
            onOpenNewCategoryModal={handleOpenNewCategoryModal}
            onEditCategory={handleOpenEditCategoryModal}
            onDeleteCategory={(id) => void handleDeleteCategory(id)}
            onOpenTaskForCategory={(catId) => handleOpenNewTaskModal(catId)}
          />
        )}

        {workspace.activeView === 'analytics' && (
          <AnalyticsResumeView
            selectedDate={workspace.selectedDate}
            onSelectDate={workspace.setSelectedDate}
            dailyResume={workspace.dailyResume}
            performance={workspace.performance}
          />
        )}
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        categories={workspace.categories}
        defaultDate={workspace.selectedDate}
        editingTask={editingTask}
        onSubmit={handleSaveTask}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
        onSubmit={handleSaveCategory}
      />
    </div>
  );
};

export default App;
