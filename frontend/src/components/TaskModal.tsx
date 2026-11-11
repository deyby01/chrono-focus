import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Category,
  ChecklistItem,
  CreateTaskPayload,
  Task,
  TaskPriority,
  TaskStatus,
} from '../models/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  defaultDate: string;
  editingTask: Task | null;
  onSubmit: (payload: CreateTaskPayload, taskId?: number) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultDate,
  editingTask,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [plannedMinutes, setPlannedMinutes] = useState<number>(45);
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate);
  const [scheduledStartTime, setScheduledStartTime] = useState<string>('09:00');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategoryId(editingTask.category_id);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setPlannedMinutes(editingTask.planned_duration_minutes);
      setScheduledDate(editingTask.scheduled_date);
      setScheduledStartTime(editingTask.scheduled_start_time || '');
      setChecklist(editingTask.checklist || []);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 1);
      setPriority('medium');
      setStatus('pending');
      setPlannedMinutes(45);
      setScheduledDate(defaultDate);
      setScheduledStartTime('');
      setChecklist([]);
    }
    setNewStepText('');
    setFormError(null);
  }, [editingTask, categories, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistStep = () => {
    const trimmed = newStepText.trim();
    if (!trimmed) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: trimmed,
        done: false,
      },
    ]);
    setNewStepText('');
  };

  const handleRemoveStep = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          priority,
          status,
          planned_duration_minutes: Math.max(1, Number(plannedMinutes)),
          scheduled_date: scheduledDate,
          scheduled_start_time: scheduledStartTime.trim() || null,
          checklist,
        },
        editingTask?.id
      );
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-50">
              {editingTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Define what you will complete, its category type, and how much time you will invest.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/35 px-3.5 py-2.5 text-xs text-rose-200">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Task / Learning Title *</label>
            <input
              type="text"
              placeholder="e.g., PostgreSQL Indexing Course Module 5, Build React Dashboard..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Task Type / Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60 transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Planned Time (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={plannedMinutes}
                onChange={(e) => setPlannedMinutes(Number(e.target.value))}
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500/60 tabular"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {[25, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPlannedMinutes(m)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                      plannedMinutes === m
                        ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Time Slot (Optional)</label>
              <input
                type="time"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500/60 tabular"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Description / Learning Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Specific goals, links, chapters, or deliverables so you stay focused..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300">
              Action Checklist / Sub-steps
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a concrete step (e.g., Complete exercise 1)..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistStep();
                  }
                }}
                className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
              />
              <button
                type="button"
                onClick={handleAddChecklistStep}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition"
              >
                <Plus size={14} /> Add Step
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    <span>{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(item.id)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 pt-4 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-800/80 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 text-xs font-bold shadow-glow-emerald transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create & Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
