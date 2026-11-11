import React from 'react';
import {
  Timer,
  CalendarCheck2,
  Layers,
  BarChart3,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ActiveView, DailyResume } from '../models/types';
import { formatDurationHuman, getLocalDateString } from '../utils/timeFormatters';

interface SidebarNavProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dailyResume: DailyResume | null;
  isTimerRunning: boolean;
  timerFormatted: string;
  onOpenNewTaskModal: () => void;
  onOpenNewCategoryModal: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onSelectView,
  selectedDate,
  onSelectDate,
  dailyResume,
  isTimerRunning,
  timerFormatted,
  onOpenNewTaskModal,
  onOpenNewCategoryModal,
}) => {
  const navItems: Array<{
    id: ActiveView;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'focus',
      label: 'Focus Studio',
      subtitle: 'Reverse chronometer & queue',
      icon: <Timer size={18} />,
    },
    {
      id: 'schedule',
      label: 'Schedule & Tasks',
      subtitle: 'Time-blocks & checklist',
      icon: <CalendarCheck2 size={18} />,
    },
    {
      id: 'categories',
      label: 'Task Types',
      subtitle: 'Courses, projects & hobbies',
      icon: <Layers size={18} />,
    },
    {
      id: 'analytics',
      label: 'Daily Resume & Best',
      subtitle: 'Records & time analytics',
      icon: <BarChart3 size={18} />,
    },
  ];

  const summary = dailyResume?.summary;
  const plannedSec = summary?.plannedSeconds || 0;
  const focusedSec = summary?.focusedSeconds || 0;
  const dailyBudgetPct =
    plannedSec > 0 ? Math.min(100, Math.round((focusedSec / plannedSec) * 100)) : 0;

  return (
    <aside className="w-full lg:w-[272px] shrink-0 bg-zinc-950/90 border-b lg:border-b-0 lg:border-r border-zinc-800/80 px-4 py-6 flex flex-col gap-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto z-20 backdrop-blur-xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 flex items-center justify-center text-zinc-950 shadow-glow-emerald">
          <Timer size={20} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            ChronoFocus
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </h1>
          <p className="text-[11px] text-zinc-500 font-medium">Minimalist Time & Focus OS</p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs py-2.5 px-4 transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] active:scale-[0.99]"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Schedule New Task</span>
        </button>
        <button
          type="button"
          onClick={onOpenNewCategoryModal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-300 hover:text-zinc-100 border border-zinc-800/90 hover:border-zinc-700 font-medium text-xs py-2 px-4 transition-all"
        >
          <Layers size={14} className="text-emerald-400" />
          <span>New Task Type</span>
        </button>
      </div>

      {/* Active Schedule Date Selector */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 shadow-glass-inset">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Schedule Date
          </span>
          {selectedDate !== getLocalDateString() && (
            <button
              type="button"
              onClick={() => onSelectDate(getLocalDateString())}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Today
            </button>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/60 transition"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <span className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Workspace
        </span>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-900 border-zinc-700/80 text-zinc-50 shadow-glass-inset'
                  : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <span
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              >
                {item.icon}
              </span>
              <span className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-semibold tracking-tight">{item.label}</span>
                <span className="text-[11px] text-zinc-500 truncate">{item.subtitle}</span>
              </span>
              {item.id === 'focus' && isTimerRunning && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-semibold tabular animate-pulse">
                  {timerFormatted}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Execution Pulse Footer Card */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3.5 flex flex-col gap-3 shadow-glass-inset">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Flame size={14} className="text-amber-400" />
            <span>Daily Pulse</span>
          </span>
          <span className="font-mono font-bold text-emerald-400 tabular">{dailyBudgetPct}%</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-300"
            style={{ width: `${dailyBudgetPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-zinc-950/90 border border-zinc-800/70 px-2.5 py-2">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Clock size={11} className="text-cyan-400" /> Focused
            </span>
            <p className="text-xs font-bold text-zinc-100 mt-0.5 tabular">
              {formatDurationHuman(focusedSec)}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-950/90 border border-zinc-800/70 px-2.5 py-2">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-400" /> Done
            </span>
            <p className="text-xs font-bold text-zinc-100 mt-0.5 tabular">
              {summary?.completedTasks ?? 0}/{summary?.totalTasks ?? 0}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
