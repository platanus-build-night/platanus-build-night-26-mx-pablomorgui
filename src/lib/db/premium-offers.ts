import { getSupabase } from '../supabase';
import type { PremiumOffer, PremiumOfferWithMatch, Match } from './types';

export async function getOffersBySeller(
  sellerId: string,
): Promise<PremiumOfferWithMatch[]> {
  const { data, error } = await getSupabase()
    .from('premium_offers')
    .select(
      `
      id,
      premium_seller_id,
      match_id,
      category,
      price_per_ticket,
      currency,
      quantity,
      show_in_search,
      notifications_enabled,
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
    `,
    )
    .eq('premium_seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch offers: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    premium_seller_id: row.premium_seller_id,
    match_id: row.match_id,
    category: row.category,
    price_per_ticket: row.price_per_ticket,
    currency: row.currency,
    quantity: row.quantity,
    show_in_search: row.show_in_search,
    notifications_enabled: row.notifications_enabled,
    match: row.matches as unknown as Match,
  }));
}

export async function countActiveOffers(sellerId: string): Promise<number> {
  const { count, error } = await getSupabase()
    .from('premium_offers')
    .select('id', { count: 'exact', head: true })
    .eq('premium_seller_id', sellerId)
    .or('show_in_search.eq.true,notifications_enabled.eq.true');

  if (error) throw new Error(`Failed to count offers: ${error.message}`);
  return count ?? 0;
}

export type CreateOfferParams = {
  premiumSellerId: string;
  matchId: string;
  category: string | null;
  pricePerTicket: number;
  currency: string;
  quantity: number;
};

export async function createOffer(params: CreateOfferParams): Promise<string> {
  const { data, error } = await getSupabase()
    .from('premium_offers')
    .insert({
      premium_seller_id: params.premiumSellerId,
      match_id: params.matchId,
      category: params.category,
      price_per_ticket: params.pricePerTicket,
      currency: params.currency,
      quantity: params.quantity,
      show_in_search: true,
      notifications_enabled: true,
      accepts_trades: null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('DUPLICATE');
    }
    throw new Error(`Failed to create offer: ${error.message}`);
  }

  return data.id;
}

export type UpdateOfferParams = {
  category?: string | null;
  pricePerTicket?: number;
  currency?: string;
  quantity?: number;
  active?: boolean;
};

export async function updateOffer(
  offerId: string,
  sellerId: string,
  params: UpdateOfferParams,
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (params.category !== undefined) updates.category = params.category;
  if (params.pricePerTicket !== undefined)
    updates.price_per_ticket = params.pricePerTicket;
  if (params.currency !== undefined) updates.currency = params.currency;
  if (params.quantity !== undefined) updates.quantity = params.quantity;
  if (params.active !== undefined) {
    updates.show_in_search = params.active;
    updates.notifications_enabled = params.active;
  }

  const { error } = await getSupabase()
    .from('premium_offers')
    .update(updates)
    .eq('id', offerId)
    .eq('premium_seller_id', sellerId);

  if (error) {
    if (error.code === '23505') {
      throw new Error('DUPLICATE');
    }
    throw new Error(`Failed to update offer: ${error.message}`);
  }
}

export async function getOfferById(
  offerId: string,
  sellerId: string,
): Promise<PremiumOffer | null> {
  const { data, error } = await getSupabase()
    .from('premium_offers')
    .select('*')
    .eq('id', offerId)
    .eq('premium_seller_id', sellerId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch offer: ${error.message}`);
  return data as PremiumOffer | null;
}
