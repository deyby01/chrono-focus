import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Save,
  Sparkles,
  Clock,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Task } from '../models/types';
import {
  formatCountdown,
  formatDurationHuman,
  formatMinutesHuman,
} from '../utils/timeFormatters';
import { IconRenderer } from './IconRenderer';

interface ReverseChronometerProps {
  activeTask: Task | null;
  availableTasks: Task[];
  onSelectTask: (task: Task) => void;
  targetSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  progressPercent: number;
  isRunning: boolean;
  soundEnabled: boolean;
  sessionNotes: string;
  autoCompleteTask: boolean;
  lastCompletedBanner: string | null;
  onToggleSound: (enabled: boolean) => void;
  onChangeNotes: (notes: string) => void;
  onToggleAutoComplete: (enabled: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: (customMinutes?: number) => void;
  onAdjustMinutes: (deltaMinutes: number) => void;
  onSetCustomMinutes: (minutes: number) => void;
  onLogProgress: (markCompleted?: boolean) => Promise<void>;
  onToggleChecklistItem: (task: Task, itemId: string) => Promise<void>;
  onOpenNewTaskModal: () => void;
}

const PRESET_MINUTES = [15, 25, 45, 60, 90];

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
  medium: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  high: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
};

export const ReverseChronometer: React.FC<ReverseChronometerProps> = ({
  activeTask,
  availableTasks,
  onSelectTask,
  targetSeconds,
  remainingSeconds,
  elapsedSeconds,
  progressPercent,
  isRunning,
  soundEnabled,
  sessionNotes,
  autoCompleteTask,
  lastCompletedBanner,
  onToggleSound,
  onChangeNotes,
  onToggleAutoComplete,
  onStart,
  onPause,
  onReset,
  onAdjustMinutes,
  onSetCustomMinutes,
  onLogProgress,
  onToggleChecklistItem,
  onOpenNewTaskModal,
}) => {
  const [customMinInput, setCustomMinInput] = useState<string>('');

  const radius = 124;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(customMinInput);
    if (parsed > 0) {
      onSetCustomMinutes(parsed);
      setCustomMinInput('');
    }
  };

  if (!activeTask) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-10 text-center flex flex-col items-center justify-center gap-4 shadow-glass-inset">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
          <Clock size={24} />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h3 className="text-base font-bold text-zinc-100">No Active Task Selected</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Select a task from your daily schedule or create a new one to initialize the reverse
            countdown chronometer.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-4 py-2.5 shadow-glow-emerald transition"
        >
          <Plus size={15} strokeWidth={2.5} /> Create First Task
        </button>
      </div>
    );
  }

  const ringColor = isRunning
    ? '#10B981'
    : remainingSeconds < targetSeconds
    ? '#F59E0B'
    : activeTask.category_color || '#38BDF8';

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 flex flex-col gap-5 shadow-glass-inset backdrop-blur-md relative overflow-hidden">
      {/* Subtle Top Glow matching ring color */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl opacity-20 transition-colors duration-500"
        style={{ backgroundColor: ringColor }}
      />

      {lastCompletedBanner && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 px-3.5 py-2.5 text-xs font-semibold text-emerald-300">
          <Sparkles size={15} className="text-emerald-400 shrink-0" />
          <span>{lastCompletedBanner}</span>
        </div>
      )}

      {/* Top Selector Bar */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
            Active Focus Target
          </span>
          <select
            value={activeTask.id}
            onChange={(e) => {
              const found = availableTasks.find((t) => t.id === Number(e.target.value));
              if (found) onSelectTask(found);
            }}
            className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500/60 transition"
          >
            {availableTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.scheduled_start_time ? `[${t.scheduled_start_time}] ` : ''}
                {t.title} ({t.planned_duration_minutes}m planned)
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onToggleSound(!soundEnabled)}
          title={soundEnabled ? 'Completion sound enabled' : 'Completion sound muted'}
          className={`p-2 rounded-xl border transition ${
            soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Task Metadata Badges */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
          style={{
            backgroundColor: `${activeTask.category_color}15`,
            color: activeTask.category_color,
            borderColor: `${activeTask.category_color}38`,
          }}
        >
          <IconRenderer name={activeTask.category_icon} size={12} />
          <span>{activeTask.category_name}</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
            PRIORITY_STYLES[activeTask.priority] || PRIORITY_STYLES.medium
          }`}
        >
          {activeTask.priority}
        </span>
        <span className="text-zinc-400 text-xs tabular ml-auto">
          Planned: <strong className="text-zinc-200">{formatMinutesHuman(activeTask.planned_duration_minutes)}</strong>
          {' • '}
          Spent: <strong className="text-emerald-400">{formatDurationHuman(activeTask.actual_duration_seconds)}</strong>
        </span>
      </div>

      {/* Circular Reverse Countdown Ring */}
      <div className="flex justify-center py-2">
        <div className="relative w-[280px] h-[280px] flex items-center justify-center">
          <svg className="-rotate-90 w-[280px] h-[280px]" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={radius}
              strokeWidth="6"
              fill="transparent"
              className="stroke-zinc-800/75"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              strokeWidth="7"
              fill="transparent"
              stroke={ringColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.45s linear, stroke 0.3s ease',
                filter: `drop-shadow(0 0 10px ${ringColor}55)`,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border ${
                isRunning
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                  : remainingSeconds < targetSeconds
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                  : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
              }`}
            >
              {isRunning
                ? 'Reverse Countdown'
                : remainingSeconds < targetSeconds
                ? 'Paused'
                : 'Ready to Focus'}
            </span>
            <div className="font-mono text-5xl font-bold tracking-tight text-zinc-50 tabular">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2.5 tabular">
              <span>Target: {Math.round(targetSeconds / 60)}m</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">
                Elapsed: {formatDurationHuman(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Preset & Custom Adjuster Row */}
      <div className="flex items-center justify-center flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onAdjustMinutes(-5)}
          disabled={isRunning || targetSeconds <= 300}
          className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition tabular"
        >
          <Minus size={12} /> 5m
        </button>

        {PRESET_MINUTES.map((mins) => {
          const isSelected = Math.round(targetSeconds / 60) === mins;
          return (
            <button
              key={mins}
              type="button"
              onClick={() => onSetCustomMinutes(mins)}
              disabled={isRunning}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition tabular disabled:opacity-40 disabled:pointer-events-none ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {mins}m
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onAdjustMinutes(5)}
          disabled={isRunning}
          className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition tabular"
        >
          <Plus size={12} /> 5m
        </button>

        <form onSubmit={handleApplyCustomMinutes} className="inline-flex items-center gap-1">
          <input
            type="number"
            min="1"
            max="480"
            placeholder="Min"
            value={customMinInput}
            onChange={(e) => setCustomMinInput(e.target.value)}
            disabled={isRunning}
            className="w-16 rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 disabled:opacity-40 tabular"
          />
          <button
            type="submit"
            disabled={isRunning || !customMinInput.trim()}
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 disabled:opacity-40 transition"
          >
            Set
          </button>
        </form>
      </div>

      {/* Primary Timer Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm px-6 py-3 shadow-glow-emerald transition active:scale-[0.99]"
          >
            <Play size={17} fill="currentColor" />
            <span>
              {remainingSeconds < targetSeconds ? 'Resume Countdown' : 'Start Reverse Timer'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-sm px-6 py-3 shadow-glow-amber transition"
          >
            <Pause size={17} />
            <span>Pause Timer</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onReset()}
          title="Reset to task planned duration"
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-xs px-4 py-3 transition"
        >
          <RotateCcw size={15} />
          <span>Reset ({activeTask.planned_duration_minutes}m)</span>
        </button>
      </div>

      {/* Session Notes & Save Controls */}
      <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Session focus note (optional)..."
          value={sessionNotes}
          onChange={(e) => onChangeNotes(e.target.value)}
          className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition"
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoCompleteTask}
              onChange={(e) => onToggleAutoComplete(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0"
            />
            <span>Complete task at 00:00</span>
          </label>

          <div className="flex items-center gap-2">
            {elapsedSeconds > 0 && (
              <button
                type="button"
                onClick={() => void onLogProgress(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 transition tabular"
              >
                <Save size={13} className="text-cyan-400" />
                <span>Log {formatDurationHuman(elapsedSeconds)}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void onLogProgress(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold px-3 py-1.5 transition tabular"
            >
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>
                Complete & Save (
                {elapsedSeconds > 0
                  ? formatDurationHuman(elapsedSeconds)
                  : formatMinutesHuman(Math.round(targetSeconds / 60))}
                )
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Task Execution Checklist */}
      {activeTask.checklist && activeTask.checklist.length > 0 && (
        <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-widest text-zinc-500">
              Execution Steps
            </span>
            <span className="font-mono text-emerald-400 font-semibold tabular">
              {activeTask.checklist.filter((i) => i.done).length}/{activeTask.checklist.length} done
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {activeTask.checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void onToggleChecklistItem(activeTask, item.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-left border transition ${
                  item.done
                    ? 'bg-zinc-900/40 border-zinc-800/50 text-zinc-500 line-through'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {item.done ? (
                  <CheckSquare size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <Square size={14} className="text-zinc-500 shrink-0" />
                )}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
