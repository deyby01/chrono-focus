import React from 'react';

type IconButtonTone = 'neutral' | 'danger' | 'muted';

const TONE_CLASSES: Record<IconButtonTone, string> = {
  // Edit-style action and modal close buttons.
  neutral: 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80',
  // Destructive actions (delete task / category / session).
  danger: 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10',
  // Modal close buttons sitting on a lighter zinc-900 surface.
  muted: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone;
  /** Required because icon-only buttons have no visible text label. */
  'aria-label': string;
}

/**
 * Square icon-only button used for edit/delete/close affordances. Collapses the
 * `p-1.5 rounded-lg ...` recipe repeated in TaskCard, CategoriesView, the
 * session list, and both modal headers.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  tone = 'neutral',
  type = 'button',
  className = '',
  children,
  ...rest
}) => (
  <button
    type={type}
    className={`p-1.5 rounded-lg transition ${TONE_CLASSES[tone]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
