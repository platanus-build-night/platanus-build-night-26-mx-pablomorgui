import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full bg-background px-3 py-2 text-sm font-medium border-2 border-black rounded-md shadow-[3px_3px_0_0_#000] transition-all placeholder:text-muted-foreground focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
