import React from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Category, Task } from '../models/types';
import {
  formatDurationHuman,
  formatMinutesHuman,
  formatReadableDate,
} from '../utils/timeFormatters';
import { TaskCard } from '../components/TaskCard';

interface SchedulePlannerViewProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  categoryFilter?: number;
  onChangeCategoryFilter: (id?: number) => void;
  statusFilter: string;
  onChangeStatusFilter: (status: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  activeTask: Task | null;
  onLaunchInChronometer: (task: Task) => void;
  onToggleTaskStatus: (task: Task) => void;
  onToggleChecklistItem: (task: Task, itemId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onOpenNewTaskModal: () => void;
}

export const SchedulePlannerView: React.FC<SchedulePlannerViewProps> = ({
  tasks,
  categories,
  selectedDate,
  onSelectDate,
  categoryFilter,
  onChangeCategoryFilter,
  statusFilter,
  onChangeStatusFilter,
  searchQuery,
  onChangeSearchQuery,
  activeTask,
  onLaunchInChronometer,
  onToggleTaskStatus,
  onToggleChecklistItem,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const totalPlannedMinutes = tasks.reduce((acc, t) => acc + t.planned_duration_minutes, 0);
  const totalActualSeconds = tasks.reduce((acc, t) => acc + t.actual_duration_seconds, 0);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Time Blocking & Task Organizer
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50 mt-1">
            Daily Schedule & Task Planner
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Plan every course module, engineering project, or hobby with explicit time budgets so
            your day stays structured.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-2.5 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition shrink-0"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Schedule New Task</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/80 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-glass-inset">
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks, courses, projects..."
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5">
            <Calendar size={14} className="text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-zinc-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5">
            <Filter size={14} className="text-cyan-400" />
            <select
              value={categoryFilter ?? ''}
              onChange={(e) =>
                onChangeCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
              }
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            >
              <option value="">All Task Types</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => onChangeStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {(categoryFilter || statusFilter || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                onChangeCategoryFilter(undefined);
                onChangeStatusFilter('');
                onChangeSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Budget Summary Banner */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Clock size={15} className="text-cyan-400" />
          <span>
            Date: <strong className="text-zinc-100">{selectedDate ? formatReadableDate(selectedDate) : 'All Dates'}</strong>
          </span>
        </div>
        <div className="text-zinc-400 tabular">
          Planned Commitment:{' '}
          <strong className="text-zinc-100">{formatMinutesHuman(totalPlannedMinutes)}</strong>
        </div>
        <div className="text-zinc-400 tabular">
          Actual Time Invested:{' '}
          <strong className="text-emerald-400">{formatDurationHuman(totalActualSeconds)}</strong>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400 tabular">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>
            Completed: <strong className="text-zinc-100">{completedCount}</strong> / {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 py-14 px-6 text-center flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold text-zinc-200">No tasks match your current filters</h3>
          <p className="text-xs text-zinc-500">
            Create a task for {formatReadableDate(selectedDate)} or clear your filters.
          </p>
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-4 py-2 shadow-glow-emerald transition"
          >
            <Plus size={15} /> Create Task
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={activeTask?.id === task.id}
              onSelectForTimer={onLaunchInChronometer}
              onToggleStatus={onToggleTaskStatus}
              onToggleChecklistItem={onToggleChecklistItem}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
