import { getSupabase } from '../supabase';

const FX_RATE = 17.3;

type RawOffer = {
  id: string;
  seller_id: string;
  match_id: string;
  price_per_ticket: number;
  currency: string;
  quantity: number;
  category: string | null;
  confidence: number | null;
  review_reason: string | null;
  extracted_at: string;
};

type NormalizedOffer = RawOffer & {
  categoryNorm: string;
  priceUsd: number;
};

export type CategoryStats = {
  category: string;
  median: number;
  p25: number;
  p75: number;
  count: number;
};

export type MatchPriceStats = {
  matchId: string;
  minPrice: number | null;
  currency: string;
  cat1: CategoryStats | null;
  cat2: CategoryStats | null;
  cat3: CategoryStats | null;
  offerCount: number;
};

function normalizeCategory(category: string | null): string {
  if (!category) return 'UNKNOWN';
  const upper = category.toUpperCase().trim();
  if (upper.includes('1')) return 'CAT 1';
  if (upper.includes('2')) return 'CAT 2';
  if (upper.includes('3')) return 'CAT 3';
  if (upper.includes('4')) return 'CAT 4';
  return 'OTHER';
}

function calculateStats(prices: number[]): Omit<CategoryStats, 'category'> | null {
  if (prices.length === 0) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
  const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;

  return {
    median: Math.round(median),
    p25: Math.round(p25),
    p75: Math.round(p75),
    count: sorted.length,
  };
}

export async function getMarketStatsForAllMatches(): Promise<Map<string, MatchPriceStats>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  const cutoffIso = cutoffDate.toISOString();

  // Fetch active offers from last 7 days (paginate to bypass 1000 row limit)
  const PAGE_SIZE = 1000;
  let allOffers: RawOffer[] = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await getSupabase()
      .from('offers')
      .select('id,seller_id,match_id,price_per_ticket,currency,quantity,category,confidence,review_reason,extracted_at')
      .eq('status', 'active')
      .not('match_id', 'is', null)
      .gte('extracted_at', cutoffIso)
      .range(from, to);

    if (error) throw new Error(`Failed to fetch offers: ${error.message}`);

    const pageData = (data ?? []) as RawOffer[];
    allOffers = allOffers.concat(pageData);

    if (pageData.length < PAGE_SIZE) break;
    page++;
  }

  const offers = allOffers;

  // Filter outliers and low confidence
  const filtered = offers.filter(
    (o) =>
      o.review_reason !== 'price_outlier' &&
      (o.confidence === null || o.confidence >= 0.7),
  );

  // Normalize
  const normalized: NormalizedOffer[] = filtered.map((o) => ({
    ...o,
    categoryNorm: normalizeCategory(o.category),
    priceUsd: o.currency === 'MXN' ? o.price_per_ticket / FX_RATE : o.price_per_ticket,
  }));

  // Dedup by (match_id, seller_id, categoryNorm) - keep most recent
  // Sort by extracted_at desc first
  normalized.sort((a, b) => new Date(b.extracted_at).getTime() - new Date(a.extracted_at).getTime());

  const deduped = new Map<string, NormalizedOffer>();
  for (const o of normalized) {
    const key = `${o.match_id}|${o.seller_id}|${o.categoryNorm}`;
    if (!deduped.has(key)) {
      deduped.set(key, o);
    }
  }

  // Group by match and category (include all offers, including orphans qty=1)
  const matchOffers = new Map<string, Map<string, number[]>>();

  for (const o of deduped.values()) {
    let matchMap = matchOffers.get(o.match_id);
    if (!matchMap) {
      matchMap = new Map();
      matchOffers.set(o.match_id, matchMap);
    }

    const prices = matchMap.get(o.categoryNorm) ?? [];
    prices.push(o.priceUsd);
    matchMap.set(o.categoryNorm, prices);
  }

  // Calculate stats per match
  const result = new Map<string, MatchPriceStats>();

  for (const [matchId, categoryMap] of matchOffers) {
    const cat1Prices = categoryMap.get('CAT 1') ?? [];
    const cat2Prices = categoryMap.get('CAT 2') ?? [];
    const cat3Prices = categoryMap.get('CAT 3') ?? [];

    const cat1Stats = calculateStats(cat1Prices);
    const cat2Stats = calculateStats(cat2Prices);
    const cat3Stats = calculateStats(cat3Prices);

    const allPrices = [...cat1Prices, ...cat2Prices, ...cat3Prices];
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

    result.set(matchId, {
      matchId,
      minPrice: minPrice !== null ? Math.round(minPrice) : null,
      currency: 'USD',
      cat1: cat1Stats ? { category: 'CAT 1', ...cat1Stats } : null,
      cat2: cat2Stats ? { category: 'CAT 2', ...cat2Stats } : null,
      cat3: cat3Stats ? { category: 'CAT 3', ...cat3Stats } : null,
      offerCount: allPrices.length,
    });
  }

  return result;
}
