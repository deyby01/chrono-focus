import React from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Task } from '../models/types';
import { formatDurationHuman, formatMinutesHuman } from '../utils/timeFormatters';
import { IconRenderer } from './IconRenderer';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onSelectForTimer: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onToggleChecklistItem: (task: Task, itemId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
  medium: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  high: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-zinc-800/70 text-zinc-400',
  in_progress: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  archived: 'bg-zinc-800 text-zinc-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isActive,
  onSelectForTimer,
  onToggleStatus,
  onToggleChecklistItem,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';
  const plannedSeconds = task.planned_duration_minutes * 60;
  const progressPct =
    plannedSeconds > 0
      ? Math.min(100, Math.round((task.actual_duration_seconds / plannedSeconds) * 100))
      : 0;

  return (
    <div
      className={`group rounded-xl border p-4 transition-all duration-200 ${
        isActive
          ? 'bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_24px_-8px_rgba(16,185,129,0.28)]'
          : 'bg-zinc-900/45 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/80'
      } ${isCompleted ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          className={`mt-0.5 transition ${
            isCompleted
              ? 'text-emerald-400 hover:text-emerald-300'
              : 'text-zinc-600 hover:text-zinc-300'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-1.5">
            {task.scheduled_start_time && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] font-semibold tabular">
                {task.scheduled_start_time}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: `${task.category_color}15`,
                color: task.category_color,
                borderColor: `${task.category_color}38`,
              }}
            >
              <IconRenderer name={task.category_icon} size={11} />
              <span>{task.category_name}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium
              }`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                STATUS_BADGE[task.status] || STATUS_BADGE.pending
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div>
            <h4
              className={`text-sm font-semibold tracking-tight ${
                isCompleted ? 'line-through text-zinc-400' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{task.description}</p>
            )}
          </div>

          {task.checklist && task.checklist.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {task.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleChecklistItem(task, item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] border transition ${
                    item.done
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 line-through'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {item.done ? <CheckSquare size={12} /> : <Square size={12} />}
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Planned vs Spent Progress Bar */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 tabular">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} className="text-zinc-500" />
                Planned: <strong className="text-zinc-200">{formatMinutesHuman(task.planned_duration_minutes)}</strong>
              </span>
              <span>
                Spent:{' '}
                <strong className="text-zinc-200">
                  {formatDurationHuman(task.actual_duration_seconds)}
                </strong>{' '}
                <span className="text-zinc-500">({progressPct}%)</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/70">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: isCompleted ? '#10B981' : task.category_color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCompleted && (
            <button
              type="button"
              onClick={() => onSelectForTimer(task)}
              title="Load into reverse chronometer"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-glow-emerald'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950'
              }`}
            >
              <Play size={13} fill="currentColor" />
              <span>{isActive ? 'Focusing' : 'Focus'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
