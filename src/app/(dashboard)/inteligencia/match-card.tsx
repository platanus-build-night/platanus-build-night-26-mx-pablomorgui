import Link from 'next/link';
import type { Match } from '@/lib/db';
import type { MatchPriceStats } from '@/lib/db/offers';
import { getTeamFlag, getTeamNameEs } from '@/lib/constants';
import { MapPin, Calendar } from 'lucide-react';

type MatchCardProps = {
  match: Match;
  stats: MatchPriceStats | null;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

function formatPrice(price: number | null): string {
  if (price === null) return '-';
  return `$${price.toLocaleString()}`;
}

function formatCity(city: string): string {
  if (city === 'Mexico City') return 'CDMX';
  if (city === 'New York/New Jersey') return 'NY/NJ';
  return city;
}

export function MatchCard({ match, stats }: MatchCardProps) {
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  const homeDisplay = homeTeam
    ? `${getTeamNameEs(homeTeam)} ${getTeamFlag(homeTeam)}`
    : match.home_placeholder ?? '?';

  const awayFlag = awayTeam ? getTeamFlag(awayTeam) : null;
  const awayName = awayTeam ? getTeamNameEs(awayTeam) : (match.away_placeholder ?? '?');

  return (
    <Link href={`/inteligencia/${match.id}`}>
      <div className="border-2 border-black rounded-md bg-background shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] p-3 sm:p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000] sm:hover:shadow-[2px_2px_0_0_#000] transition-all cursor-pointer">
        {/* Header: Number + Teams */}
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
          <div className="shrink-0 rounded border-2 border-black bg-primary px-1.5 py-0.5 sm:px-2 text-center">
            <span className="text-xs sm:text-sm font-bold">M{match.match_number}</span>
          </div>
          <span className="text-sm sm:text-base font-bold leading-tight">
            {homeDisplay} &nbsp;vs&nbsp; {awayFlag}<span className="ml-1">{awayName}</span>
          </span>
        </div>

        {/* Location + Date */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {formatCity(match.city)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {formatDate(match.kickoff_at)}
          </span>
        </div>

        {/* Price */}
        {stats && stats.minPrice !== null ? (
          <>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Desde</p>
            <p className="text-lg sm:text-xl font-bold">
              {formatPrice(stats.minPrice)} <span className="text-xs sm:text-sm">{stats.currency}</span>
            </p>

            {/* Categories - show median */}
            <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <div className="flex-1 rounded border-2 border-black bg-muted px-1.5 py-1 sm:px-2 sm:py-1.5 text-center">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Cat 1</p>
                <p className="text-xs sm:text-sm font-bold">{formatPrice(stats.cat1?.median ?? null)}</p>
              </div>
              <div className="flex-1 rounded border-2 border-black bg-muted px-1.5 py-1 sm:px-2 sm:py-1.5 text-center">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Cat 2</p>
                <p className="text-xs sm:text-sm font-bold">{formatPrice(stats.cat2?.median ?? null)}</p>
              </div>
              <div className="flex-1 rounded border-2 border-black bg-muted px-1.5 py-1 sm:px-2 sm:py-1.5 text-center">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Cat 3</p>
                <p className="text-xs sm:text-sm font-bold">{formatPrice(stats.cat3?.median ?? null)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Sin ofertas</p>
        )}
      </div>
    </Link>
  );
}
