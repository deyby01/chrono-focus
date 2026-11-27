import React, { useCallback } from 'react';
import { Task } from './models/types';
import { useWorkspaceController } from './controllers/useWorkspaceController';
import { useReverseTimerController } from './controllers/useReverseTimerController';
import { useViewTransitionRouter } from './controllers/useViewTransitionRouter';
import { useTaskModalController } from './controllers/useTaskModalController';
import { useCategoryModalController } from './controllers/useCategoryModalController';
import { formatCountdown } from './utils/timeFormatters';
import { AlertBanner } from './components/ui';
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

  const selectView = useViewTransitionRouter(workspace.activeView, workspace.setActiveView);

  const taskModal = useTaskModalController(workspace);
  const categoryModal = useCategoryModalController(workspace);

  const toggleTaskStatus = useCallback(
    (task: Task) => {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      void workspace.updateTask(task.id, { status: nextStatus });
    },
    [workspace]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row relative selection:bg-emerald-500/30">
      <a
        href="#main-view-heading"
        className="visually-hidden fixed top-3 left-3 z-50 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-glow-emerald"
      >
        Skip to main content
      </a>

      {/* Subtle Ambient Top Shine */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,rgba(16,185,129,0.08),rgba(99,102,241,0.04),transparent)] z-0"
      />

      <SidebarNav
        activeView={workspace.activeView}
        onSelectView={selectView}
        selectedDate={workspace.selectedDate}
        onSelectDate={workspace.setSelectedDate}
        dailyResume={workspace.dailyResume}
        isTimerRunning={timerState.isRunning}
        timerFormatted={formatCountdown(timerState.remainingSeconds)}
        onOpenNewTaskModal={() => taskModal.openNew()}
        onOpenNewCategoryModal={categoryModal.openNew}
      />

      <main className="flex-1 min-w-0 px-6 py-7 lg:px-10 lg:py-8 max-w-[1440px] w-full mx-auto relative z-10">
        {workspace.error && (
          <AlertBanner
            tone="error"
            message={workspace.error}
            actionLabel="Retry Connection"
            onAction={workspace.refresh}
          />
        )}

        {categoryModal.actionAlert && (
          <AlertBanner
            tone="warning"
            message={categoryModal.actionAlert}
            actionLabel="Dismiss"
            onAction={categoryModal.dismissAlert}
          />
        )}

        {workspace.activeView === 'focus' && (
          <FocusDashboardView
            selectedDate={workspace.selectedDate}
            dailyResume={workspace.dailyResume}
            performance={workspace.performance}
            activeTask={workspace.activeTask}
            onSelectTask={workspace.setActiveTask}
            timerState={timerState}
            onToggleTaskStatus={toggleTaskStatus}
            onToggleChecklistItem={workspace.toggleChecklistItem}
            onEditTask={taskModal.openEdit}
            onDeleteTask={(id) => void workspace.deleteTask(id)}
            onDeleteSession={(id) => void workspace.deleteFocusSession(id)}
            onOpenNewTaskModal={() => taskModal.openNew()}
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
            onToggleTaskStatus={toggleTaskStatus}
            onToggleChecklistItem={(task, itemId) =>
              void workspace.toggleChecklistItem(task, itemId)
            }
            onEditTask={taskModal.openEdit}
            onDeleteTask={(id) => void workspace.deleteTask(id)}
            onOpenNewTaskModal={() => taskModal.openNew()}
          />
        )}

        {workspace.activeView === 'categories' && (
          <CategoriesView
            categories={workspace.categories}
            onOpenNewCategoryModal={categoryModal.openNew}
            onEditCategory={categoryModal.openEdit}
            onDeleteCategory={(id) => void categoryModal.remove(id)}
            onOpenTaskForCategory={(catId) => taskModal.openNew(catId)}
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
        isOpen={taskModal.isOpen}
        onClose={taskModal.close}
        categories={workspace.categories}
        defaultDate={workspace.selectedDate}
        defaultCategoryId={taskModal.preselectedCategoryId}
        editingTask={taskModal.editingTask}
        onSubmit={taskModal.save}
      />

      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={categoryModal.close}
        editingCategory={categoryModal.editingCategory}
        onSubmit={categoryModal.save}
      />
    </div>
  );
};

export default App;
