import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSupplierInventory, getAllSuppliers, getAllMatches } from '@/lib/db';
import { InventoryFilters } from './inventory-filters';
import { InventoryTable } from './inventory-table';

const ALLOWED_EMAIL = 'parcerosmundialin@gmail.com';

type PageProps = {
  searchParams: Promise<{
    supplier?: string;
    q?: string;
  }>;
};

export default async function InventarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.email !== ALLOWED_EMAIL) {
    redirect('/inteligencia');
  }

  const [inventory, suppliers, matches] = await Promise.all([
    getSupplierInventory({
      supplierId: params.supplier,
      searchQuery: params.q,
    }),
    getAllSuppliers(),
    getAllMatches(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventario</h1>

      <InventoryFilters suppliers={suppliers} matches={matches} />

      <InventoryTable inventory={inventory} suppliers={suppliers} matches={matches} />
    </div>
  );
}
