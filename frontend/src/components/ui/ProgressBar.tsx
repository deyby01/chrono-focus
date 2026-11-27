import React from 'react';

interface ProgressBarProps {
  /** Progress value clamped to 0–100. */
  value: number;
  /** Accessible label for the underlying <progress> element. */
  label: string;
  /** Fill color; a CSS color string (e.g. a category color) or Tailwind class via `fillClassName`. */
  color?: string;
  fillClassName?: string;
  /** Tailwind classes for the track container (border/background variations). */
  trackClassName?: string;
}

/**
 * Accessible progress bar: a visually-hidden native <progress> for assistive
 * tech plus a styled fill. Collapses the duplicated progress markup in
 * TaskCard, CategoriesView, and SidebarNav.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
  fillClassName = '',
  trackClassName = 'h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/70',
}) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <>
      <progress value={pct} max={100} aria-label={label} className="visually-hidden" />
      <div aria-hidden="true" className={trackClassName}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillClassName}`}
          style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </>
  );
};
