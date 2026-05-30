'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'max-h-[85vh] overflow-y-auto',
            className,
          )}
        >
          <div className="flex items-center justify-between border-b-2 border-black bg-primary px-4 py-3 rounded-t-[4px]">
            <Dialog.Title className="text-base font-bold uppercase tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded border-2 border-black bg-background transition-transform hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
              <X className="h-4 w-4" strokeWidth={3} />
            </Dialog.Close>
          </div>
          <div className="p-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
