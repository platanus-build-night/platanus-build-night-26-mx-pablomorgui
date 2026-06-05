'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  value: string;
  label: string;
  searchTerms?: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'No se encontraron resultados.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        opt.searchTerms?.toLowerCase().includes(lower),
    );
  }, [options, search]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal>
      <Popover.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-10 w-full items-center justify-between bg-background px-3 py-2 text-left text-sm font-medium border-2 border-black rounded-md shadow-[3px_3px_0_0_#000] transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none focus:outline-none cursor-pointer',
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[100] w-[var(--radix-popover-trigger-width)] border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000]"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              autoFocus={false}
              className="h-10 w-full border-b-2 border-black bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
            />
            <CommandList className="max-h-60 overflow-y-auto overscroll-contain touch-pan-y">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </CommandEmpty>
              <CommandGroup className="p-1">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="relative flex cursor-pointer select-none items-center rounded px-2 py-2 text-sm font-medium outline-none hover:bg-primary data-[selected=true]:bg-primary"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                      strokeWidth={3}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
