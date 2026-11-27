import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // White call-to-action used in view headers ("New Task", "Schedule Task", ...).
  primary:
    'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.12)]',
  // Muted zinc button used for secondary actions (Reset, Add Step, ...).
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold',
  // Emerald accent button used for primary form submits and empty-state CTAs.
  accent:
    'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-glow-emerald disabled:opacity-50',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Shared text button. Centralizes the three repeated Tailwind button recipes
 * (white primary, zinc secondary, emerald accent) that were duplicated across
 * every view header, modal footer, and empty state.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs transition shrink-0 ${VARIANT_CLASSES[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
