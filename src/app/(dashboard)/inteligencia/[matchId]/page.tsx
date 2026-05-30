import { notFound } from 'next/navigation';
import { getMatchById, getAlertsByMatch } from '@/lib/db';
import { getPriceHistory } from '@/lib/db/price-history';
import { getSession, getUserById } from '@/lib/auth';
import { getTeamFlag, getTeamNameEs } from '@/lib/constants';
import { MapPin, Calendar } from 'lucide-react';
import { PriceTab } from './price-tab';
import { AlertsTab } from './alerts-tab';
import { TabSwitcher } from './tab-switcher';

type PageProps = {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ days?: string; tab?: string }>;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCity(city: string): string {
  if (city === 'Mexico City') return 'CDMX';
  if (city === 'New York/New Jersey') return 'NY/NJ';
  return city;
}

export default async function MatchDetailPage({ params, searchParams }: PageProps) {
  const { matchId } = await params;
  const { days: daysParam, tab: tabParam } = await searchParams;

  const session = await getSession();
  const match = await getMatchById(matchId);
  if (!match) notFound();

  const days = daysParam === '3' ? 3 : daysParam === '5' ? 5 : 7;
  const activeTab = tabParam === 'alertas' ? 'alertas' : 'precios';

  const [priceData, alerts, user] = await Promise.all([
    getPriceHistory(matchId, days),
    session ? getAlertsByMatch(session.userId, matchId) : Promise.resolve([]),
    session ? getUserById(session.userId) : Promise.resolve(null),
  ]);

  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  const homeDisplay = homeTeam
    ? `${getTeamNameEs(homeTeam)} ${getTeamFlag(homeTeam)}`
    : match.home_placeholder ?? '?';

  const awayDisplay = awayTeam
    ? `${getTeamFlag(awayTeam)} ${getTeamNameEs(awayTeam)}`
    : match.away_placeholder ?? '?';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="shrink-0 rounded border-2 border-black bg-primary px-3 py-1">
            <span className="text-lg font-bold">M{match.match_number}</span>
          </div>
          <h1 className="text-2xl font-bold">
            {homeDisplay} vs. {awayDisplay}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {match.venue}, {formatCity(match.city)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(match.kickoff_at)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher activeTab={activeTab} matchId={matchId} />

      {/* Tab content */}
      {activeTab === 'precios' ? (
        <PriceTab priceData={priceData} currentDays={days} matchId={matchId} />
      ) : (
        <AlertsTab matchId={matchId} alerts={alerts} userWhatsApp={user?.whatsapp_number ?? null} />
      )}
    </div>
  );
}
