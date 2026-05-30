'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
        checked ? 'bg-primary' : 'bg-muted',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full border-2 border-black bg-background transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
