import { getSupabase } from '../supabase';
import type { Match } from './types';

export async function getAllMatches(): Promise<Match[]> {
  const { data, error } = await getSupabase()
    .from('matches')
    .select('*')
    .order('match_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch matches: ${error.message}`);
  return data as Match[];
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await getSupabase()
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch match: ${error.message}`);
  return data as Match | null;
}
