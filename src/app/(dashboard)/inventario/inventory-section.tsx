'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupplierInventoryWithDetails, Supplier, Match } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from './inventory-table';
import { NewInventoryModal } from './new-inventory-modal';

type InventorySectionProps = {
  inventory: SupplierInventoryWithDetails[];
  suppliers: Supplier[];
  matches: Match[];
};

export function InventorySection({
  inventory,
  suppliers: initialSuppliers,
  matches,
}: InventorySectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  function handleSupplierCreated(supplier: Supplier) {
    setSuppliers((prev) => [...prev, supplier].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '')
    ));
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={3} />
          Nuevo registro
        </Button>
      </div>

      <InventoryTable inventory={inventory} suppliers={suppliers} matches={matches} />

      <NewInventoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        suppliers={suppliers}
        matches={matches}
        onSupplierCreated={handleSupplierCreated}
      />
    </>
  );
}
