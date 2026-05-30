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

export type DailyPricePoint = {
  date: string;
  cat1: number | null;
  cat2: number | null;
  cat3: number | null;
};

export type CategoryTrend = {
  category: string;
  currentMedian: number | null;
  previousMedian: number | null;
  changePercent: number | null;
  direction: 'up' | 'down' | 'stable' | null;
};

export type CategoryStat = {
  median: number;
  p25: number;
  p75: number;
  count: number;
};

export type QuantityMode = 'pairs' | 'orphans' | 'all';

export type PriceHistoryData = {
  matchId: string;
  days: number;
  // Per mode data
  pairs: {
    dailyPrices: DailyPricePoint[];
    trends: CategoryTrend[];
    cat1: CategoryStat | null;
    cat2: CategoryStat | null;
    cat3: CategoryStat | null;
  };
  orphans: {
    dailyPrices: DailyPricePoint[];
    trends: CategoryTrend[];
    cat1: CategoryStat | null;
    cat2: CategoryStat | null;
    cat3: CategoryStat | null;
  };
  all: {
    dailyPrices: DailyPricePoint[];
    trends: CategoryTrend[];
    cat1: CategoryStat | null;
    cat2: CategoryStat | null;
    cat3: CategoryStat | null;
  };
};

function normalizeCategory(category: string | null): string {
  if (!category) return 'UNKNOWN';
  const upper = category.toUpperCase().trim();
  if (upper.includes('1') && upper.includes('FRONT')) return 'CAT 1';
  if (upper.includes('1')) return 'CAT 1';
  if (upper.includes('2')) return 'CAT 2';
  if (upper.includes('3')) return 'CAT 3';
  if (upper.includes('4')) return 'CAT 4';
  return 'OTHER';
}

function calculateMedian(prices: number[]): number | null {
  if (prices.length === 0) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  return Math.round(sorted[Math.floor(sorted.length / 2)] ?? 0);
}

function calculateStats(prices: number[]): CategoryStat | null {
  if (prices.length === 0) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  return {
    median: Math.round(sorted[Math.floor(sorted.length / 2)] ?? 0),
    p25: Math.round(sorted[Math.floor(sorted.length * 0.25)] ?? 0),
    p75: Math.round(sorted[Math.floor(sorted.length * 0.75)] ?? 0),
    count: prices.length,
  };
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

function buildDailyPrices(dailyData: Map<string, Map<string, number[]>>): DailyPricePoint[] {
  const dates = Array.from(dailyData.keys()).sort();
  return dates.map((date) => {
    const dayMap = dailyData.get(date)!;
    return {
      date,
      cat1: calculateMedian(dayMap.get('CAT 1') ?? []),
      cat2: calculateMedian(dayMap.get('CAT 2') ?? []),
      cat3: calculateMedian(dayMap.get('CAT 3') ?? []),
    };
  });
}

function buildTrends(dailyPrices: DailyPricePoint[]): CategoryTrend[] {
  const halfPoint = Math.floor(dailyPrices.length / 2);
  const firstHalf = dailyPrices.slice(0, Math.max(1, halfPoint));
  const secondHalf = dailyPrices.slice(Math.max(1, halfPoint));

  function getTrend(category: 'cat1' | 'cat2' | 'cat3', label: string): CategoryTrend {
    const firstPrices = firstHalf.map(d => d[category]).filter((p): p is number => p !== null);
    const secondPrices = secondHalf.map(d => d[category]).filter((p): p is number => p !== null);

    const prevMedian = calculateMedian(firstPrices);
    const currMedian = calculateMedian(secondPrices);

    if (prevMedian === null || currMedian === null) {
      return { category: label, currentMedian: currMedian, previousMedian: prevMedian, changePercent: null, direction: null };
    }

    const change = ((currMedian - prevMedian) / prevMedian) * 100;
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (change > 5) direction = 'up';
    else if (change < -5) direction = 'down';

    return {
      category: label,
      currentMedian: currMedian,
      previousMedian: prevMedian,
      changePercent: Math.round(change),
      direction,
    };
  }

  return [
    getTrend('cat1', 'CAT 1'),
    getTrend('cat2', 'CAT 2'),
    getTrend('cat3', 'CAT 3'),
  ];
}

export async function getPriceHistory(matchId: string, days: number): Promise<PriceHistoryData> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffIso = cutoffDate.toISOString();

  const { data, error } = await getSupabase()
    .from('offers')
    .select('id,seller_id,match_id,price_per_ticket,currency,quantity,category,confidence,review_reason,extracted_at')
    .eq('match_id', matchId)
    .eq('status', 'active')
    .gte('extracted_at', cutoffIso)
    .order('extracted_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch offers: ${error.message}`);

  const offers = (data ?? []) as RawOffer[];

  // Filter outliers and low confidence
  const filtered = offers.filter(
    (o) =>
      o.review_reason !== 'price_outlier' &&
      (o.confidence === null || o.confidence >= 0.7),
  );

  // Daily data per mode
  const pairsDailyData = new Map<string, Map<string, number[]>>();
  const orphansDailyData = new Map<string, Map<string, number[]>>();
  const allDailyData = new Map<string, Map<string, number[]>>();

  // Category totals per mode
  const pairPrices = new Map<string, number[]>([['CAT 1', []], ['CAT 2', []], ['CAT 3', []]]);
  const orphanPrices = new Map<string, number[]>([['CAT 1', []], ['CAT 2', []], ['CAT 3', []]]);
  const allPrices = new Map<string, number[]>([['CAT 1', []], ['CAT 2', []], ['CAT 3', []]]);

  // Dedup by (date, seller_id, category)
  const seenKeys = new Set<string>();

  for (const o of filtered) {
    const categoryNorm = normalizeCategory(o.category);
    if (!['CAT 1', 'CAT 2', 'CAT 3'].includes(categoryNorm)) continue;

    const priceUsd = o.currency === 'MXN' ? o.price_per_ticket / FX_RATE : o.price_per_ticket;
    const dateStr = getDateString(new Date(o.extracted_at));
    const dedupKey = `${dateStr}|${o.seller_id}|${categoryNorm}`;

    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    const isOrphan = o.quantity === 1;

    // Helper to add to daily data
    function addToDaily(map: Map<string, Map<string, number[]>>) {
      if (!map.has(dateStr)) map.set(dateStr, new Map());
      const dayMap = map.get(dateStr)!;
      if (!dayMap.has(categoryNorm)) dayMap.set(categoryNorm, []);
      dayMap.get(categoryNorm)!.push(priceUsd);
    }

    // Add to appropriate buckets
    allPrices.get(categoryNorm)!.push(priceUsd);
    addToDaily(allDailyData);

    if (isOrphan) {
      orphanPrices.get(categoryNorm)!.push(priceUsd);
      addToDaily(orphansDailyData);
    } else {
      pairPrices.get(categoryNorm)!.push(priceUsd);
      addToDaily(pairsDailyData);
    }
  }

  // Build results per mode
  const pairsDailyPrices = buildDailyPrices(pairsDailyData);
  const orphansDailyPrices = buildDailyPrices(orphansDailyData);
  const allDailyPrices = buildDailyPrices(allDailyData);

  return {
    matchId,
    days,
    pairs: {
      dailyPrices: pairsDailyPrices,
      trends: buildTrends(pairsDailyPrices),
      cat1: calculateStats(pairPrices.get('CAT 1')!),
      cat2: calculateStats(pairPrices.get('CAT 2')!),
      cat3: calculateStats(pairPrices.get('CAT 3')!),
    },
    orphans: {
      dailyPrices: orphansDailyPrices,
      trends: buildTrends(orphansDailyPrices),
      cat1: calculateStats(orphanPrices.get('CAT 1')!),
      cat2: calculateStats(orphanPrices.get('CAT 2')!),
      cat3: calculateStats(orphanPrices.get('CAT 3')!),
    },
    all: {
      dailyPrices: allDailyPrices,
      trends: buildTrends(allDailyPrices),
      cat1: calculateStats(allPrices.get('CAT 1')!),
      cat2: calculateStats(allPrices.get('CAT 2')!),
      cat3: calculateStats(allPrices.get('CAT 3')!),
    },
  };
}
