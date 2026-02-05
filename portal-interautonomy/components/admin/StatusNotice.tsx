
'use client';

import { useState } from 'react';

type Variant = 'success' | 'info' | 'warning' | 'error';

type Props = {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
  live?: 'polite' | 'assertive' | 'off';
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
};

const VARIANT_STYLES: Record<Variant, { container: string; icon: string }> = {
  success: {
    container:
      'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100',
    icon: 'text-emerald-700 dark:text-emerald-300',
  },
  info: {
    container:
      'border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-100',
    icon: 'text-sky-700 dark:text-sky-300',
  },
  warning: {
    container:
      'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100',
    icon: 'text-amber-700 dark:text-amber-300',
  },
  error: {
    container:
      'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100',
    icon: 'text-rose-700 dark:text-rose-300',
  },
};

function SuccessIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconForVariant({ variant, className }: { variant: Variant; className: string }) {
  if (variant === 'success') return <SuccessIcon className={className} />;
  return (
    <span aria-hidden="true" className={className}>
      ●
    </span>
  );
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      <path d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" />
    </svg>
  );
}

export default function StatusNotice({
  variant,
  children,
  className,
  live = 'polite',
  dismissible = false,
  dismissLabel = 'Close notification',
  onDismiss,
}: Props) {
  const styles = VARIANT_STYLES[variant];
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${styles.container} ${className ?? ''}`}
      aria-live={live}
    >
      <IconForVariant variant={variant} className={`mt-0.5 h-5 w-5 ${styles.icon}`} />
      <div className="min-w-0 flex-1">{children}</div>
      {dismissible ? (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
          aria-label={dismissLabel}
          className={`-mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${styles.icon}`}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
