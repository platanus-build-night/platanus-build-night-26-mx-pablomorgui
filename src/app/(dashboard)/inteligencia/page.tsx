import { getAllMatches } from '@/lib/db';
import { getMarketStatsForAllMatches } from '@/lib/db/offers';
import { getTeamNameEs } from '@/lib/constants';
import { Filters } from './filters';
import { MatchCard } from './match-card';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    city?: string;
    stage?: string;
    team?: string;
    q?: string;
  }>;
};

export default async function InteligenciaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [matches, statsMap] = await Promise.all([
    getAllMatches(),
    getMarketStatsForAllMatches(),
  ]);

  // Get unique teams for filter
  const teamsSet = new Set<string>();
  for (const match of matches) {
    if (match.home_team) teamsSet.add(match.home_team);
    if (match.away_team) teamsSet.add(match.away_team);
  }
  const teams = Array.from(teamsSet).sort();

  // Filter matches
  let filteredMatches = matches;

  if (params.city) {
    filteredMatches = filteredMatches.filter((m) => m.city === params.city);
  }

  if (params.stage) {
    filteredMatches = filteredMatches.filter((m) => m.stage === params.stage);
  }

  if (params.team) {
    filteredMatches = filteredMatches.filter(
      (m) => m.home_team === params.team || m.away_team === params.team,
    );
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    filteredMatches = filteredMatches.filter((m) => {
      const matchNum = `m${m.match_number}`;
      const homeEs = getTeamNameEs(m.home_team)?.toLowerCase() || '';
      const awayEs = getTeamNameEs(m.away_team)?.toLowerCase() || '';
      const home = m.home_team?.toLowerCase() || '';
      const away = m.away_team?.toLowerCase() || '';
      const city = m.city.toLowerCase();

      return (
        matchNum.includes(q) ||
        home.includes(q) ||
        away.includes(q) ||
        homeEs.includes(q) ||
        awayEs.includes(q) ||
        city.includes(q) ||
        m.match_number.toString() === q
      );
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inteligencia de precios</h1>
        <p className="text-muted-foreground">
          Explora precios de los 104 partidos del Mundial 2026
        </p>
      </div>

      <Filters teams={teams} />

      {(() => {
        const matchesWithOffers = filteredMatches.filter(
          (m) => statsMap.has(m.id) && statsMap.get(m.id)!.minPrice !== null
        );

        if (matchesWithOffers.length === 0) {
          return (
            <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
              <p className="font-semibold text-muted-foreground">
                No se encontraron partidos con ofertas
              </p>
            </div>
          );
        }

        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchesWithOffers.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                stats={statsMap.get(match.id) || null}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
