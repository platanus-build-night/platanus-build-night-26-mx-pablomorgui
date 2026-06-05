import { getSupabase } from '../supabase';
import type { Match } from './types';

export type Supplier = {
  id: string;
  phone_number: string;
  name: string | null;
  group_jid: string | null;
  active: boolean;
  created_at: string;
  default_currency: string | null;
};

export type SupplierInventoryItem = {
  id: string;
  supplier_id: string;
  match_id: string;
  category: string | null;
  block: string | null;
  row: string | null;
  quantity: number;
  price_per_ticket: number | null;
  sale_price: number | null;
  currency: string;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierInventoryWithDetails = SupplierInventoryItem & {
  match: Match;
  supplier: Supplier;
};

export async function getAllSuppliers(): Promise<Supplier[]> {
  const { data, error } = await getSupabase()
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
  return data ?? [];
}

export async function getSupplierInventory(filters?: {
  supplierId?: string;
  searchQuery?: string;
}): Promise<SupplierInventoryWithDetails[]> {
  let query = getSupabase()
    .from('supplier_inventory')
    .select(`
      id,
      supplier_id,
      match_id,
      category,
      block,
      row,
      quantity,
      price_per_ticket,
      sale_price,
      currency,
      notes,
      active,
      created_at,
      updated_at,
      suppliers!inner (
        id,
        phone_number,
        name,
        group_jid,
        active,
        created_at,
        default_currency
      ),
      matches!inner (
        id,
        match_number,
        stage,
        group_label,
        home_team,
        away_team,
        home_placeholder,
        away_placeholder,
        kickoff_at,
        venue,
        city
      )
    `);

  if (filters?.supplierId) {
    query = query.eq('supplier_id', filters.supplierId);
  }

  query = query.eq('active', true);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch inventory: ${error.message}`);

  let items = (data ?? []).map((row) => ({
    id: row.id,
    supplier_id: row.supplier_id,
    match_id: row.match_id,
    category: row.category,
    block: row.block,
    row: row.row,
    quantity: row.quantity,
    price_per_ticket: row.price_per_ticket,
    sale_price: row.sale_price,
    currency: row.currency,
    notes: row.notes,
    active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    match: row.matches as unknown as Match,
    supplier: row.suppliers as unknown as Supplier,
  }));

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    items = items.filter((item) => {
      const matchNum = `m${item.match.match_number}`;
      const homeTeam = item.match.home_team?.toLowerCase() ?? '';
      const awayTeam = item.match.away_team?.toLowerCase() ?? '';
      const homePlaceholder = item.match.home_placeholder?.toLowerCase() ?? '';
      const awayPlaceholder = item.match.away_placeholder?.toLowerCase() ?? '';
      const city = item.match.city.toLowerCase();
      const supplierName = item.supplier.name?.toLowerCase() ?? '';

      return (
        matchNum.includes(q) ||
        homeTeam.includes(q) ||
        awayTeam.includes(q) ||
        homePlaceholder.includes(q) ||
        awayPlaceholder.includes(q) ||
        city.includes(q) ||
        supplierName.includes(q) ||
        item.match.match_number.toString() === q
      );
    });
  }

  items.sort((a, b) => {
    const matchDiff = a.match.match_number - b.match.match_number;
    if (matchDiff !== 0) return matchDiff;
    const aPrice = a.sale_price ?? a.price_per_ticket;
    const bPrice = b.sale_price ?? b.price_per_ticket;
    return aPrice - bPrice;
  });

  return items;
}

export type CreateInventoryItemParams = {
  supplierId: string;
  matchId: string;
  category: string | null;
  block: string | null;
  row: string | null;
  quantity: number;
  pricePerTicket: number;
  salePrice: number | null;
  currency: string;
  notes: string | null;
};

export async function createInventoryItem(
  params: CreateInventoryItemParams,
): Promise<string> {
  const { data, error } = await getSupabase()
    .from('supplier_inventory')
    .insert({
      supplier_id: params.supplierId,
      match_id: params.matchId,
      category: params.category,
      block: params.block,
      row: params.row,
      quantity: params.quantity,
      price_per_ticket: params.pricePerTicket,
      sale_price: params.salePrice,
      currency: params.currency,
      notes: params.notes,
      active: true,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create inventory item: ${error.message}`);
  return data.id;
}

export type UpdateInventoryItemParams = {
  category?: string | null;
  block?: string | null;
  row?: string | null;
  quantity?: number;
  pricePerTicket?: number;
  salePrice?: number | null;
  currency?: string;
  notes?: string | null;
  active?: boolean;
};

export async function updateInventoryItem(
  itemId: string,
  params: UpdateInventoryItemParams,
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (params.category !== undefined) updates.category = params.category;
  if (params.block !== undefined) updates.block = params.block;
  if (params.row !== undefined) updates.row = params.row;
  if (params.quantity !== undefined) updates.quantity = params.quantity;
  if (params.pricePerTicket !== undefined) updates.price_per_ticket = params.pricePerTicket;
  if (params.salePrice !== undefined) updates.sale_price = params.salePrice;
  if (params.currency !== undefined) updates.currency = params.currency;
  if (params.notes !== undefined) updates.notes = params.notes;
  if (params.active !== undefined) updates.active = params.active;

  const { error } = await getSupabase()
    .from('supplier_inventory')
    .update(updates)
    .eq('id', itemId);

  if (error) throw new Error(`Failed to update inventory item: ${error.message}`);
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('supplier_inventory')
    .delete()
    .eq('id', itemId);

  if (error) throw new Error(`Failed to delete inventory item: ${error.message}`);
}

export type CreateSupplierParams = {
  phoneNumber: string;
  name: string | null;
  defaultCurrency: string | null;
};

export async function createSupplier(params: CreateSupplierParams): Promise<Supplier> {
  const { data, error } = await getSupabase()
    .from('suppliers')
    .insert({
      phone_number: params.phoneNumber,
      name: params.name,
      default_currency: params.defaultCurrency,
      active: true,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create supplier: ${error.message}`);
  return data;
}
