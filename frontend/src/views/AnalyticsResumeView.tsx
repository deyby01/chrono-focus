import React from 'react';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  BarChart3,
  Layers,
  Calendar,
} from 'lucide-react';
import { DailyResume, PerformanceMetrics } from '../models/types';
import {
  formatDurationHuman,
  formatMinutesHuman,
  formatReadableDate,
} from '../utils/timeFormatters';
import { IconRenderer } from '../components/IconRenderer';

interface AnalyticsResumeViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dailyResume: DailyResume | null;
  performance: PerformanceMetrics | null;
}

export const AnalyticsResumeView: React.FC<AnalyticsResumeViewProps> = ({
  selectedDate,
  onSelectDate,
  dailyResume,
  performance,
}) => {
  const summary = dailyResume?.summary;
  const overall = performance?.overall;
  const weekly = performance?.weeklyActivity || [];
  const maxWeeklySeconds = Math.max(3600, ...weekly.map((d) => d.focused_seconds));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Daily Resume & Personal Records
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50 mt-1">
            Time Analytics, Daily Resume & Best Time
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Review your daily accomplishments, best focus records, peak productivity hours, and total
            time spent completing tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 shrink-0">
          <Calendar size={14} className="text-emerald-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-transparent text-xs font-mono text-zinc-200 focus:outline-none"
          />
        </div>
      </header>

      {/* 4 Personal Record Highlight Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 border-t-2 border-t-amber-400/70 p-4 flex items-start gap-3.5 shadow-glass-inset">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              My Best Single Focus Time
            </span>
            <div className="text-2xl font-bold text-zinc-50 mt-0.5 tabular">
              {performance?.bestSession
                ? formatDurationHuman(performance.bestSession.duration_seconds)
                : '0m'}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {performance?.bestSession
                ? `${performance.bestSession.task_title} (${performance.bestSession.category_name})`
                : 'No focus sessions recorded yet'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 border-t-2 border-t-emerald-400/70 p-4 flex items-start gap-3.5 shadow-glass-inset">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Best Productive Day Record
            </span>
            <div className="text-2xl font-bold text-zinc-50 mt-0.5 tabular">
              {performance?.bestDay
                ? formatDurationHuman(performance.bestDay.total_seconds)
                : '0m'}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {performance?.bestDay
                ? `${formatReadableDate(performance.bestDay.date)} • ${
                    performance.bestDay.sessions_count
                  } sessions`
                : 'Log sessions to track your record day'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 border-t-2 border-t-violet-400/70 p-4 flex items-start gap-3.5 shadow-glass-inset">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Peak Productivity Window
            </span>
            <div className="text-2xl font-bold text-zinc-50 mt-0.5 tabular">
              {performance?.peakProductivityHour
                ? performance.peakProductivityHour.formattedRange
                : '—'}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {performance?.peakProductivityHour
                ? `${formatDurationHuman(
                    performance.peakProductivityHour.totalSeconds
                  )} focused in this hour slot`
                : 'Your best hour of the day'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 border-t-2 border-t-cyan-400/70 p-4 flex items-start gap-3.5 shadow-glass-inset">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Time Spent Completing Tasks
            </span>
            <div className="text-2xl font-bold text-zinc-50 mt-0.5 tabular">
              {formatDurationHuman(overall?.completed_tasks_focused_seconds || 0)}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 tabular truncate">
              Across {overall?.total_tasks_completed || 0} completed tasks (Total:{' '}
              {formatDurationHuman(overall?.total_focused_seconds || 0)})
            </p>
          </div>
        </div>
      </section>

      {/* Two Column Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Resume Card */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 flex flex-col gap-5 shadow-glass-inset">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Daily Resume ({formatReadableDate(selectedDate)})
              </span>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                <Clock size={15} className="text-emerald-400" />
                <span>End-of-Day Summary & Category Breakdown</span>
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-xs font-mono font-bold text-emerald-300 tabular">
              {summary?.completionRate ?? 0}% Completed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular">
            <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/80 p-3">
              <span className="text-[11px] text-zinc-500 block">Time Focused</span>
              <strong className="text-base font-bold text-emerald-400">
                {formatDurationHuman(summary?.focusedSeconds || 0)}
              </strong>
            </div>
            <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/80 p-3">
              <span className="text-[11px] text-zinc-500 block">Time Planned</span>
              <strong className="text-base font-bold text-zinc-100">
                {formatDurationHuman(summary?.plannedSeconds || 0)}
              </strong>
            </div>
            <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/80 p-3">
              <span className="text-[11px] text-zinc-500 block">Tasks Done</span>
              <strong className="text-base font-bold text-zinc-100">
                {summary?.completedTasks ?? 0} / {summary?.totalTasks ?? 0}
              </strong>
            </div>
            <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/80 p-3">
              <span className="text-[11px] text-zinc-500 block">Focus Sprints</span>
              <strong className="text-base font-bold text-cyan-400">
                {summary?.sessionsCount ?? 0}
              </strong>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {(dailyResume?.categoryBreakdown || []).map((cat) => {
              const targetSeconds = (cat.daily_target_minutes || 60) * 60;
              const pct =
                targetSeconds > 0
                  ? Math.min(100, Math.round((cat.focused_seconds / targetSeconds) * 100))
                  : 0;
              return (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <IconRenderer name={cat.icon} size={14} color={cat.color} />
                      <strong className="text-zinc-200">{cat.name}</strong>
                      <span className="text-zinc-500 tabular">
                        ({cat.completed_count}/{cat.tasks_count} tasks)
                      </span>
                    </div>
                    <div className="tabular text-zinc-300">
                      <strong className="text-zinc-100">
                        {formatDurationHuman(cat.focused_seconds)}
                      </strong>
                      <span className="text-zinc-500">
                        {' '}
                        / {formatMinutesHuman(cat.daily_target_minutes)} target
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/60">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Activity & All-Time Category Allocation Card */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 flex flex-col gap-5 shadow-glass-inset">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Consistency & Momentum
              </span>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                <BarChart3 size={15} className="text-cyan-400" />
                <span>Last 7 Days Focus Activity</span>
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 tabular">
              Avg Session: {formatDurationHuman(overall?.average_session_seconds || 0)}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2.5 h-52 pt-2">
            {weekly.map((day) => {
              const heightPct = Math.max(
                6,
                Math.round((day.focused_seconds / maxWeeklySeconds) * 100)
              );
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => onSelectDate(day.date)}
                  title={`${day.date}: ${formatDurationHuman(day.focused_seconds)} (${
                    day.tasks_completed
                  } tasks completed)`}
                  className={`rounded-xl border p-2 flex flex-col items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.18)]'
                      : 'bg-zinc-950/70 border-zinc-800/70 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-mono text-zinc-400 tabular">
                    {day.focused_seconds > 0 ? formatDurationHuman(day.focused_seconds) : '0m'}
                  </span>
                  <div className="flex-1 w-4 rounded-full bg-zinc-900 flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300"
                      style={{
                        height: `${day.focused_seconds > 0 ? heightPct : 4}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-200">{day.day_label}</span>
                  <span className="text-[10px] font-mono text-zinc-500 tabular">
                    {day.date.slice(5)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Layers size={12} className="text-violet-400" />
              All-Time Investment by Task Type
            </span>
            <div className="flex flex-wrap gap-2">
              {(performance?.categoryTotals || []).map((c) => (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-950/90 border border-zinc-800/80 px-3 py-1.5 text-xs"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: c.color,
                      boxShadow: `0 0 8px ${c.color}`,
                    }}
                  />
                  <span className="text-zinc-300">{c.name}</span>
                  <strong className="font-mono text-zinc-100 tabular">
                    {formatDurationHuman(c.total_seconds)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
