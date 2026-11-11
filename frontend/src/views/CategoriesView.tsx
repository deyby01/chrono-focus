import React from 'react';
import { Plus, Edit3, Trash2, Clock, CheckCircle2, Target } from 'lucide-react';
import { Category } from '../models/types';
import { formatDurationHuman, formatMinutesHuman } from '../utils/timeFormatters';
import { IconRenderer } from '../components/IconRenderer';

interface CategoriesViewProps {
  categories: Category[];
  onOpenNewCategoryModal: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => void;
  onOpenTaskForCategory: (categoryId: number) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onOpenNewCategoryModal,
  onEditCategory,
  onDeleteCategory,
  onOpenTaskForCategory,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Task Taxonomy & Daily Budgets
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50 mt-1">
            Task Types, Learnings & Hobbies
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Register custom task categories (courses, software projects, hobbies, reading) and set
            daily time targets for each area of your life.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewCategoryModal}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-2.5 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition shrink-0"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Register New Task Type</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const todaySpentSec = cat.today_spent_seconds || 0;
          const targetSec = (cat.daily_target_minutes || 60) * 60;
          const targetPct =
            targetSec > 0 ? Math.min(100, Math.round((todaySpentSec / targetSec) * 100)) : 0;

          return (
            <div
              key={cat.id}
              className="group relative rounded-2xl bg-zinc-900/55 border border-zinc-800/80 hover:border-zinc-700/80 p-5 flex flex-col gap-4 shadow-glass-inset transition-all overflow-hidden"
            >
              {/* Subtle top ambient accent line */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 opacity-80"
                style={{ backgroundColor: cat.color }}
              />

              <div className="flex items-center justify-between">
                <div
                  className="w-11 h-11 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${cat.color}18`,
                    color: cat.color,
                    borderColor: `${cat.color}40`,
                    boxShadow: `0 0 18px -4px ${cat.color}45`,
                  }}
                >
                  <IconRenderer name={cat.icon} size={20} />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditCategory(cat)}
                    title="Edit task type"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    title="Delete task type"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">{cat.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 min-h-[32px]">
                  {cat.description ||
                    'Dedicated category for tracking scheduled tasks and focus time.'}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 tabular">
                  <span className="inline-flex items-center gap-1.5">
                    <Target size={12} style={{ color: cat.color }} />
                    Today: <strong className="text-zinc-100">{formatDurationHuman(todaySpentSec)}</strong> /{' '}
                    {formatMinutesHuman(cat.daily_target_minutes)}
                  </span>
                  <span className="font-mono font-bold text-zinc-200">{targetPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${targetPct}%`,
                      backgroundColor: cat.color,
                      boxShadow: `0 0 10px ${cat.color}`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 tabular pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-zinc-500" />
                  All-time:{' '}
                  <strong className="text-zinc-200">
                    {formatDurationHuman(cat.total_spent_seconds || 0)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Done: <strong className="text-zinc-200">{cat.completed_tasks || 0}</strong>/
                  {cat.total_tasks || 0}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenTaskForCategory(cat.id)}
                className="w-full mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 py-2 px-3 text-xs font-semibold text-zinc-200 transition"
              >
                <Plus size={14} style={{ color: cat.color }} />
                <span>Schedule Task in {cat.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
