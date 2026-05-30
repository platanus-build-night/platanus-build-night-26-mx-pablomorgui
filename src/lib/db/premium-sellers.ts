import { getSupabase } from '../supabase';
import type { PremiumSeller } from './types';

export async function getPremiumSellerById(id: string): Promise<PremiumSeller | null> {
  const { data, error } = await getSupabase()
    .from('premium_sellers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch seller: ${error.message}`);
  return data as PremiumSeller | null;
}
