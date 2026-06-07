'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PriceHistoryData, CategoryStat, CategoryTrend } from '@/lib/db/price-history';
import { PriceChart } from './price-chart';
import { ContactDialog } from './contact-dialog';
import { TrendingUp, TrendingDown, Minus, MessageCircle } from 'lucide-react';

type PriceTabProps = {
  priceData: PriceHistoryData;
  currentDays: number;
  matchId: string;
  matchDisplay: string;
  matchNumber: number;
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
      <span className="hidden sm:inline">Estable</span>
      <span className="sm:hidden">0%</span>
    </span>
  );
}

function CategoryCard({
  label,
  categoryKey,
  stats,
  trend,
  onContact,
}: {
  label: string;
  categoryKey: string;
  stats: CategoryStat | null;
  trend: CategoryTrend | undefined;
  onContact: (category: string) => void;
}) {
  if (!stats) {
    return (
      <div className="border-2 border-black rounded-md bg-muted px-2 py-2 sm:px-3 text-center">
        <p className="font-bold text-xs sm:text-sm">{label}</p>
        <p className="text-muted-foreground text-[10px] sm:text-xs">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black rounded-md bg-background shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000] px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <p className="font-bold text-xs sm:text-sm">{label}</p>
        <TrendBadge trend={trend ?? { direction: null, changePercent: null }} />
      </div>
      <p className="text-base sm:text-lg font-bold">${stats.median}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          ${stats.p25}-${stats.p75} · {stats.count}
        </p>
<button
          onClick={() => onContact(categoryKey)}
          className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary border border-black rounded hover:bg-primary/80 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-2.5 h-2.5" />
          Buscar
        </button>
      </div>
    </div>
  );
}

const QUANTITY_MODES: { value: QuantityMode; label: string }[] = [
  { value: 'pairs', label: '2+' },
  { value: 'orphans', label: 'Huérfanos' },
  { value: 'all', label: 'Todo' },
];

export function PriceTab({ priceData, currentDays, matchId, matchDisplay, matchNumber }: PriceTabProps) {
  const router = useRouter();
  const [quantityMode, setQuantityMode] = useState<QuantityMode>('all');
  const [contactCategory, setContactCategory] = useState<string | null>(null);

  function setDays(days: number) {
    router.push(`/inteligencia/${matchId}?days=${days}`);
  }

  function handleContact(category: string) {
    setContactCategory(category);
  }

  function handleCloseContact() {
    setContactCategory(null);
  }

  const modeData = priceData[quantityMode];
  const hasData = modeData.dailyPrices.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4">
        {/* Days selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide sm:normal-case sm:tracking-normal">Periodo</span>
          <div className="flex border-2 border-black rounded-md overflow-hidden shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000]">
            {[3, 5, 7].map((d, i) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold transition-all ${
                  currentDays === d ? 'bg-primary' : 'bg-background hover:bg-muted'
                } ${i > 0 ? 'border-l-2 border-black' : ''}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Quantity mode selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide sm:normal-case sm:tracking-normal">Cantidad</span>
          <div className="flex border-2 border-black rounded-md overflow-hidden shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000]">
            {QUANTITY_MODES.map((mode, i) => (
              <button
                key={mode.value}
                onClick={() => setQuantityMode(mode.value)}
                className={`px-2 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold transition-all ${
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
      <div className="grid gap-2 sm:gap-3 grid-cols-3">
        <CategoryCard
          label="Cat 1"
          categoryKey="CAT 1"
          stats={modeData.cat1}
          trend={modeData.trends.find((t) => t.category === 'CAT 1')}
          onContact={handleContact}
        />
        <CategoryCard
          label="Cat 2"
          categoryKey="CAT 2"
          stats={modeData.cat2}
          trend={modeData.trends.find((t) => t.category === 'CAT 2')}
          onContact={handleContact}
        />
        <CategoryCard
          label="Cat 3"
          categoryKey="CAT 3"
          stats={modeData.cat3}
          trend={modeData.trends.find((t) => t.category === 'CAT 3')}
          onContact={handleContact}
        />
      </div>

      {/* Contact CTA */}
      <ContactDialog
        matchDisplay={matchDisplay}
        matchNumber={matchNumber}
        preselectedCategory={contactCategory}
        onClose={handleCloseContact}
      />

      {/* Chart */}
      {hasData ? (
        <div className="border-2 border-black rounded-md bg-background shadow-[2px_2px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] p-3 sm:p-4">
          <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Tendencia de precios</h3>
          <PriceChart data={modeData.dailyPrices} />
        </div>
      ) : (
        <div className="border-2 border-dashed border-black rounded-md bg-muted p-6 sm:p-8 text-center">
          <p className="font-semibold text-sm text-muted-foreground">
            No hay suficientes datos para mostrar la gráfica
          </p>
        </div>
      )}

      {/* Spacer for mobile sticky button */}
      <div className="sm:hidden h-16" />
    </div>
  );
}
