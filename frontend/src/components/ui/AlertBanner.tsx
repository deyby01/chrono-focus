import React from 'react';

type AlertTone = 'error' | 'warning';

const TONE_CLASSES: Record<AlertTone, string> = {
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  warning: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
};

const ACTION_CLASSES: Record<AlertTone, string> = {
  error:
    'border border-rose-400/30 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30',
  warning:
    'border border-amber-400/30 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30',
};

interface AlertBannerProps {
  tone: AlertTone;
  message: string;
  /** Label for the trailing action button. */
  actionLabel: string;
  onAction: () => void;
}

/**
 * Dismissible / retryable alert banner. Replaces the two nearly identical
 * `role="alert"` blocks (connection error + action warning) in App.tsx.
 */
export const AlertBanner: React.FC<AlertBannerProps> = ({
  tone,
  message,
  actionLabel,
  onAction,
}) => (
  <div
    role="alert"
    className={`mb-6 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
  >
    <span>{message}</span>
    <button
      type="button"
      onClick={onAction}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${ACTION_CLASSES[tone]}`}
    >
      {actionLabel}
    </button>
  </div>
);
