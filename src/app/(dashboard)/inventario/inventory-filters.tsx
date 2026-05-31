'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import type { Supplier, Match } from '@/lib/db';
import { NewInventoryModal } from './new-inventory-modal';

type InventoryFiltersProps = {
  suppliers: Supplier[];
  matches: Match[];
};

export function InventoryFilters({ suppliers, matches }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const currentSupplier = searchParams.get('supplier') ?? '';
  const currentQ = searchParams.get('q') ?? '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar partido..."
            defaultValue={currentQ}
            onChange={(e) => {
              const value = e.target.value;
              const timeout = setTimeout(() => updateParams('q', value), 300);
              return () => clearTimeout(timeout);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={currentSupplier}
          onValueChange={(value) => updateParams('supplier', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[140px] sm:w-[180px]">
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name || supplier.phone_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-1.5" strokeWidth={3} />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </div>

      <NewInventoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        suppliers={suppliers}
        matches={matches}
      />
    </>
  );
}
