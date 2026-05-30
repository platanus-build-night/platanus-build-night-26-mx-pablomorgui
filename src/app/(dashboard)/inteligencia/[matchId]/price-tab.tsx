'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PriceHistoryData, CategoryStat, CategoryTrend } from '@/lib/db/price-history';
import { PriceChart } from './price-chart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type PriceTabProps = {
  priceData: PriceHistoryData;
  currentDays: number;
  matchId: string;
};

type QuantityMode = 'pairs' | 'orphans' | 'all';

function TrendBadge({ trend }: { trend: { direction: 'up' | 'down' | 'stable' | null; changePercent: number | null } }) {
  if (trend.direction === null || trend.changePercent === null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  if (trend.direction === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-destructive font-semibold text-xs">
        <TrendingUp className="h-3 w-3" />
        +{trend.changePercent}%
      </span>
    );
  }

  if (trend.direction === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-success font-semibold text-xs">
        <TrendingDown className="h-3 w-3" />
        {trend.changePercent}%
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 text-muted-foreground font-semibold text-xs">
      <Minus className="h-3 w-3" />
      Estable
    </span>
  );
}

function CategoryCard({
  label,
  stats,
  trend,
}: {
  label: string;
  stats: CategoryStat | null;
  trend: CategoryTrend | undefined;
}) {
  if (!stats) {
    return (
      <div className="border-2 border-black rounded-md bg-muted px-3 py-2 text-center">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-muted-foreground text-xs">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black rounded-md bg-background shadow-[3px_3px_0_0_#000] px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-sm">{label}</p>
        <TrendBadge trend={trend ?? { direction: null, changePercent: null }} />
      </div>
      <p className="text-lg font-bold">${stats.median} USD</p>
      <p className="text-xs text-muted-foreground">
        ${stats.p25} - ${stats.p75} ({stats.count})
      </p>
    </div>
  );
}

const QUANTITY_MODES: { value: QuantityMode; label: string }[] = [
  { value: 'pairs', label: '2+' },
  { value: 'orphans', label: 'Huérfanos' },
  { value: 'all', label: 'Todo' },
];

export function PriceTab({ priceData, currentDays, matchId }: PriceTabProps) {
  const router = useRouter();
  const [quantityMode, setQuantityMode] = useState<QuantityMode>('all');

  function setDays(days: number) {
    router.push(`/inteligencia/${matchId}?days=${days}`);
  }

  const modeData = priceData[quantityMode];
  const hasData = modeData.dailyPrices.length > 0;

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Days selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Periodo:</span>
          <div className="flex border-2 border-black rounded-md overflow-hidden shadow-[3px_3px_0_0_#000]">
            {[3, 5, 7].map((d, i) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-sm font-semibold transition-all ${
                  currentDays === d ? 'bg-primary' : 'bg-background hover:bg-muted'
                } ${i > 0 ? 'border-l-2 border-black' : ''}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Quantity mode selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Cantidad:</span>
          <div className="flex border-2 border-black rounded-md overflow-hidden shadow-[3px_3px_0_0_#000]">
            {QUANTITY_MODES.map((mode, i) => (
              <button
                key={mode.value}
                onClick={() => setQuantityMode(mode.value)}
                className={`px-3 py-1 text-sm font-semibold transition-all ${
                  quantityMode === mode.value ? 'bg-primary' : 'bg-background hover:bg-muted'
                } ${i > 0 ? 'border-l-2 border-black' : ''}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid gap-3 grid-cols-3">
        <CategoryCard
          label="Cat 1"
          stats={modeData.cat1}
          trend={modeData.trends.find((t) => t.category === 'CAT 1')}
        />
        <CategoryCard
          label="Cat 2"
          stats={modeData.cat2}
          trend={modeData.trends.find((t) => t.category === 'CAT 2')}
        />
        <CategoryCard
          label="Cat 3"
          stats={modeData.cat3}
          trend={modeData.trends.find((t) => t.category === 'CAT 3')}
        />
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] p-4">
          <h3 className="font-bold mb-4">Tendencia de precios</h3>
          <PriceChart data={modeData.dailyPrices} />
        </div>
      ) : (
        <div className="border-2 border-dashed border-black rounded-md bg-muted p-8 text-center">
          <p className="font-semibold text-muted-foreground">
            No hay suficientes datos para mostrar la grafica
          </p>
        </div>
      )}
    </div>
  );
}
