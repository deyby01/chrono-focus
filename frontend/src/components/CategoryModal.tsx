import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { X } from 'lucide-react';
import { Category, CreateCategoryPayload } from '../models/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, IconRenderer } from './IconRenderer';
import {
  closeTopLayerDialog,
  isClickOutsideDialogContent,
} from '../utils/topLayerDialog';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  onSubmit: (payload: CreateCategoryPayload, categoryId?: number) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  onSubmit,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressedOutsideRef = useRef<boolean>(false);
  const baseId = useId();

  const headingId = `${baseId}-heading`;
  const nameInputId = `${baseId}-name`;
  const targetInputId = `${baseId}-target`;
  const descInputId = `${baseId}-desc`;

  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0].id);
  const [description, setDescription] = useState('');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setColor(editingCategory.color);
      setIcon(editingCategory.icon);
      setDescription(editingCategory.description || '');
      setDailyTargetMinutes(editingCategory.daily_target_minutes);
    } else {
      setName('');
      setColor(CATEGORY_COLORS[0]);
      setIcon(CATEGORY_ICONS[0].id);
      setDescription('');
      setDailyTargetMinutes(60);
    }
    setError(null);
  }, [editingCategory, isOpen]);

  const requestAnimatedClose = useCallback(async () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      await closeTopLayerDialog(dialog);
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      void closeTopLayerDialog(dialog);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(
        {
          name: name.trim(),
          color,
          icon,
          description: description.trim(),
          daily_target_minutes: Math.max(0, Number(dailyTargetMinutes)),
        },
        editingCategory?.id
      );
      await requestAnimatedClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task type');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      className="chrono-dialog"
      {...({ closedby: 'any' } as Record<string, unknown>)}
      onCancel={(e) => {
        e.preventDefault();
        void requestAnimatedClose();
      }}
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = '';
        }
        if (isOpen) {
          onClose();
        }
      }}
      onPointerDown={(e) => {
        if (
          typeof HTMLDialogElement !== 'undefined' &&
          !('closedBy' in HTMLDialogElement.prototype) &&
          dialogRef.current
        ) {
          pressedOutsideRef.current = isClickOutsideDialogContent(
            e.nativeEvent,
            dialogRef.current
          );
        }
      }}
      onPointerUp={(e) => {
        if (
          typeof HTMLDialogElement !== 'undefined' &&
          !('closedBy' in HTMLDialogElement.prototype) &&
          dialogRef.current
        ) {
          if (
            pressedOutsideRef.current &&
            isClickOutsideDialogContent(e.nativeEvent, dialogRef.current)
          ) {
            void requestAnimatedClose();
          }
          pressedOutsideRef.current = false;
        }
      }}
    >
      <div className="w-full max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl flex flex-col gap-5 text-zinc-100">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 id={headingId} className="text-base font-bold text-zinc-50">
              {editingCategory ? 'Edit Task Type' : 'Register New Task Type'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Organize courses, projects, hobbies, or deep work with dedicated daily targets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void requestAnimatedClose()}
            aria-label="Close task type dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-500/15 border border-rose-500/35 px-3.5 py-2.5 text-xs text-rose-200"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={nameInputId} className="text-xs font-semibold text-zinc-300">
                Task Type Name <span aria-hidden="true">*</span>
              </label>
              <input
                id={nameInputId}
                name="name"
                type="text"
                placeholder="e.g., Cloud Certifications, Side Projects..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoFocus
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={targetInputId} className="text-xs font-semibold text-zinc-300">
                Daily Target Goal (Minutes)
              </label>
              <input
                id={targetInputId}
                name="daily_target_minutes"
                type="number"
                min="0"
                max="720"
                value={dailyTargetMinutes}
                onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500/60 tabular"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={descInputId} className="text-xs font-semibold text-zinc-300">
              Description
            </label>
            <input
              id={descInputId}
              name="description"
              type="text"
              placeholder="What kind of tasks or learnings belong in this category?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-zinc-300 mb-1">
              Alive Accent Color
            </legend>
            <div className="flex items-center flex-wrap gap-2.5">
              {CATEGORY_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Select color ${swatch}`}
                  aria-pressed={color === swatch}
                  onClick={() => setColor(swatch)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === swatch
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: swatch,
                    boxShadow: color === swatch ? `0 0 14px ${swatch}` : undefined,
                  }}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-zinc-300 mb-1">Icon</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_ICONS.map((item) => {
                const selected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setIcon(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border transition ${
                      selected
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <IconRenderer
                      name={item.id}
                      size={15}
                      color={selected ? color : undefined}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 pt-4 mt-1">
            <button
              type="button"
              onClick={() => void requestAnimatedClose()}
              className="rounded-xl bg-zinc-800/80 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 text-xs font-bold shadow-glow-emerald transition disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : editingCategory
                ? 'Save Changes'
                : 'Register Task Type'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
