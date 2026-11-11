import React from 'react';
import {
  Clock,
  CheckCircle2,
  Trophy,
  Zap,
  Plus,
  Calendar,
  History,
  Trash2,
} from 'lucide-react';
import { DailyResume, PerformanceMetrics, Task } from '../models/types';
import {
  formatDurationHuman,
  formatMinutesHuman,
  formatReadableDate,
  formatTimeClock,
} from '../utils/timeFormatters';
import { ReverseChronometer } from '../components/ReverseChronometer';
import { TaskCard } from '../components/TaskCard';

interface FocusDashboardViewProps {
  selectedDate: string;
  dailyResume: DailyResume | null;
  performance: PerformanceMetrics | null;
  activeTask: Task | null;
  onSelectTask: (task: Task) => void;
  timerState: {
    targetSeconds: number;
    remainingSeconds: number;
    elapsedSeconds: number;
    progressPercent: number;
    isRunning: boolean;
    soundEnabled: boolean;
    sessionNotes: string;
    autoCompleteTask: boolean;
    lastCompletedBanner: string | null;
    setSoundEnabled: (v: boolean) => void;
    setSessionNotes: (v: string) => void;
    setAutoCompleteTask: (v: boolean) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: (m?: number) => void;
    adjustMinutes: (d: number) => void;
    setCustomCountdownMinutes: (m: number) => void;
    logCurrentProgress: (markDone?: boolean) => Promise<void>;
  };
  onToggleTaskStatus: (task: Task) => void;
  onToggleChecklistItem: (task: Task, itemId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onDeleteSession: (id: number) => void;
  onOpenNewTaskModal: () => void;
}

export const FocusDashboardView: React.FC<FocusDashboardViewProps> = ({
  selectedDate,
  dailyResume,
  performance,
  activeTask,
  onSelectTask,
  timerState,
  onToggleTaskStatus,
  onToggleChecklistItem,
  onEditTask,
  onDeleteTask,
  onDeleteSession,
  onOpenNewTaskModal,
}) => {
  const summary = dailyResume?.summary;
  const schedule = dailyResume?.schedule || [];
  const sessions = dailyResume?.sessions || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Minimalist Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Daily Execution Studio
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50 mt-1">
            Focus Workspace & Reverse Chronometer
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {formatReadableDate(selectedDate)} — Stay anchored to one task at a time and track every
            minute.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-2.5 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition shrink-0"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Task to Schedule</span>
        </button>
      </header>

      {/* 4 KPI Bento Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/80 p-4 flex flex-col gap-1.5 shadow-glass-inset hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Focused Time Today
            </span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock size={15} />
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-50 tabular">
            {formatDurationHuman(summary?.focusedSeconds || 0)}
          </div>
          <div className="text-xs text-zinc-400 tabular">
            Planned budget: <span className="text-zinc-300">{formatDurationHuman(summary?.plannedSeconds || 0)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/80 p-4 flex flex-col gap-1.5 shadow-glass-inset hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Tasks Completed Today
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-50 tabular">
            {summary?.completedTasks ?? 0}{' '}
            <span className="text-sm font-medium text-zinc-500">/ {summary?.totalTasks ?? 0}</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium tabular">
            {summary?.completionRate ?? 0}% daily completion rate
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/80 p-4 flex flex-col gap-1.5 shadow-glass-inset hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              My Best Focus Session
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy size={15} />
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-50 tabular">
            {performance?.bestSession
              ? formatDurationHuman(performance.bestSession.duration_seconds)
              : '0m'}
          </div>
          <div className="text-xs text-zinc-400 truncate">
            {performance?.bestSession
              ? performance.bestSession.task_title
              : 'Complete a countdown to set record'}
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/80 p-4 flex flex-col gap-1.5 shadow-glass-inset hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Peak Productivity Hour
            </span>
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Zap size={15} />
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-50 tabular">
            {performance?.peakProductivityHour
              ? performance.peakProductivityHour.formattedRange
              : '—'}
          </div>
          <div className="text-xs text-zinc-400 tabular">
            {performance?.peakProductivityHour
              ? `${formatDurationHuman(performance.peakProductivityHour.totalSeconds)} logged in window`
              : 'Tracked automatically from sessions'}
          </div>
        </div>
      </section>

      {/* Main Split Grid: Reverse Chronometer (Left) + Daily Queue & Sessions (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5">
          <ReverseChronometer
            activeTask={activeTask}
            availableTasks={schedule}
            onSelectTask={onSelectTask}
            targetSeconds={timerState.targetSeconds}
            remainingSeconds={timerState.remainingSeconds}
            elapsedSeconds={timerState.elapsedSeconds}
            progressPercent={timerState.progressPercent}
            isRunning={timerState.isRunning}
            soundEnabled={timerState.soundEnabled}
            sessionNotes={timerState.sessionNotes}
            autoCompleteTask={timerState.autoCompleteTask}
            lastCompletedBanner={timerState.lastCompletedBanner}
            onToggleSound={timerState.setSoundEnabled}
            onChangeNotes={timerState.setSessionNotes}
            onToggleAutoComplete={timerState.setAutoCompleteTask}
            onStart={timerState.startTimer}
            onPause={timerState.pauseTimer}
            onReset={timerState.resetTimer}
            onAdjustMinutes={timerState.adjustMinutes}
            onSetCustomMinutes={timerState.setCustomCountdownMinutes}
            onLogProgress={timerState.logCurrentProgress}
            onToggleChecklistItem={onToggleChecklistItem}
            onOpenNewTaskModal={onOpenNewTaskModal}
          />
        </div>

        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Scheduled Queue Card */}
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 flex flex-col gap-4 shadow-glass-inset">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Daily Roadmap
                </span>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                  <Calendar size={15} className="text-emerald-400" />
                  <span>Scheduled Queue ({schedule.length})</span>
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 tabular">
                {formatMinutesHuman(Math.round((summary?.plannedSeconds || 0) / 60))} planned
              </span>
            </div>

            {schedule.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-3 text-zinc-400 text-xs">
                <p>No tasks scheduled for {formatReadableDate(selectedDate)}.</p>
                <button
                  type="button"
                  onClick={onOpenNewTaskModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-3.5 py-2 transition"
                >
                  <Plus size={14} /> Schedule a Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {schedule.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isActive={activeTask?.id === task.id}
                    onSelectForTimer={onSelectTask}
                    onToggleStatus={onToggleTaskStatus}
                    onToggleChecklistItem={(t, itemId) => void onToggleChecklistItem(t, itemId)}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Focus Sprints Log */}
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 flex flex-col gap-4 shadow-glass-inset">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Session Timeline
                </span>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                  <History size={15} className="text-cyan-400" />
                  <span>Completed Focus Sprints ({sessions.length})</span>
                </h3>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No focus sessions recorded on this date yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-xl bg-zinc-950/70 border border-zinc-800/70 px-3.5 py-2.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: session.category_color,
                        boxShadow: `0 0 8px ${session.category_color}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <strong className="text-zinc-100 truncate">{session.task_title}</strong>
                        <span className="font-mono font-bold text-emerald-400 tabular shrink-0">
                          +{formatDurationHuman(session.duration_seconds)}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-zinc-500 mt-0.5 tabular">
                        <span className="text-zinc-400">{session.category_name}</span>
                        <span>•</span>
                        <span>
                          {formatTimeClock(session.started_at)} – {formatTimeClock(session.ended_at)}
                        </span>
                        {session.notes && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-400 truncate">{session.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteSession(session.id)}
                      title="Delete session log"
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
