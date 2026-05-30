import { getSupabase } from '../supabase';

export type PriceAlert = {
  id: string;
  user_id: string;
  match_id: string;
  category: string | null;
  max_price: number;
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
};

export type PriceAlertWithMatch = PriceAlert & {
  match: {
    id: string;
    match_number: number;
    home_team: string | null;
    away_team: string | null;
    home_placeholder: string | null;
    away_placeholder: string | null;
    kickoff_at: string;
    city: string;
  };
};

export async function getAlertsByUser(userId: string): Promise<PriceAlertWithMatch[]> {
  const { data, error } = await getSupabase()
    .from('price_alerts')
    .select(`
      id,
      user_id,
      match_id,
      category,
      max_price,
      active,
      created_at,
      last_triggered_at,
      matches!inner (
        id,
        match_number,
        home_team,
        away_team,
        home_placeholder,
        away_placeholder,
        kickoff_at,
        city
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    match_id: row.match_id,
    category: row.category,
    max_price: row.max_price,
    active: row.active,
    created_at: row.created_at,
    last_triggered_at: row.last_triggered_at,
    match: row.matches as unknown as PriceAlertWithMatch['match'],
  }));
}

export async function getAlertsByMatch(userId: string, matchId: string): Promise<PriceAlert[]> {
  const { data, error } = await getSupabase()
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
  return data as PriceAlert[];
}

export type CreateAlertParams = {
  userId: string;
  matchId: string;
  category: string | null;
  maxPrice: number;
};

export async function createAlert(params: CreateAlertParams): Promise<string> {
  const { data, error } = await getSupabase()
    .from('price_alerts')
    .insert({
      user_id: params.userId,
      match_id: params.matchId,
      category: params.category,
      max_price: params.maxPrice,
      active: true,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('DUPLICATE');
    }
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return data.id;
}

export async function updateAlertActive(alertId: string, userId: string, active: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('price_alerts')
    .update({ active })
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to update alert: ${error.message}`);
}

export async function deleteAlert(alertId: string, userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete alert: ${error.message}`);
}

export async function updateUserWhatsApp(userId: string, whatsappNumber: string): Promise<void> {
  const { error } = await getSupabase()
    .from('users')
    .update({ whatsapp_number: whatsappNumber })
    .eq('id', userId);

  if (error) throw new Error(`Failed to update WhatsApp number: ${error.message}`);
}
