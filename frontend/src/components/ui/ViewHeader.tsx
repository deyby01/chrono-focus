import React from 'react';

interface ViewHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow: string;
  /** Tailwind text color class for the eyebrow (e.g. `text-emerald-400`). */
  eyebrowColor?: string;
  title: string;
  description?: string;
  /** Optional right-aligned action, typically a primary Button. */
  action?: React.ReactNode;
}

/**
 * Standard page header shared by every view. Besides removing duplicated
 * markup, it centralizes `id="main-view-heading"` + `tabIndex={-1}` on the
 * <h2>, which the skip-link and view-transition focus management depend on.
 */
export const ViewHeader: React.FC<ViewHeaderProps> = ({
  eyebrow,
  eyebrowColor = 'text-emerald-400',
  title,
  description,
  action,
}) => (
  <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800/80">
    <div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${eyebrowColor}`}>
        {eyebrow}
      </span>
      <h2
        id="main-view-heading"
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight text-zinc-50 mt-1 focus:outline-none"
      >
        {title}
      </h2>
      {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
    </div>
    {action}
  </header>
);
