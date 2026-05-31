import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getOffersBySeller, countActiveOffers, getPremiumSellerById, getAllMatches } from '@/lib/db';
import { getTeamNameEs } from '@/lib/constants';
import { OffersSection } from './offers-section';
import { Filters } from '../inteligencia/filters';

type PageProps = {
  searchParams: Promise<{
    city?: string;
    stage?: string;
    team?: string;
    q?: string;
  }>;
};

export default async function PartidosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'seller' && session.role !== 'both') {
    redirect('/inteligencia');
  }

  if (!session.premiumSellerId) {
    redirect('/inteligencia');
  }

  const [offers, activeCount, seller, matches] = await Promise.all([
    getOffersBySeller(session.premiumSellerId),
    countActiveOffers(session.premiumSellerId),
    getPremiumSellerById(session.premiumSellerId),
    getAllMatches(),
  ]);

  const maxOffers = seller?.max_active_offers ?? 7;

  // Get unique teams from matches for filter
  const teamsSet = new Set<string>();
  for (const match of matches) {
    if (match.home_team) teamsSet.add(match.home_team);
    if (match.away_team) teamsSet.add(match.away_team);
  }
  const teams = Array.from(teamsSet).sort();

  // Filter offers based on search params
  let filteredOffers = offers;

  if (params.city) {
    filteredOffers = filteredOffers.filter((o) => o.match?.city === params.city);
  }

  if (params.stage) {
    filteredOffers = filteredOffers.filter((o) => o.match?.stage === params.stage);
  }

  if (params.team) {
    filteredOffers = filteredOffers.filter(
      (o) => o.match?.home_team === params.team || o.match?.away_team === params.team,
    );
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    filteredOffers = filteredOffers.filter((o) => {
      if (!o.match) return false;
      const matchNum = `m${o.match.match_number}`;
      const homeEs = getTeamNameEs(o.match.home_team)?.toLowerCase() || '';
      const awayEs = getTeamNameEs(o.match.away_team)?.toLowerCase() || '';
      const home = o.match.home_team?.toLowerCase() || '';
      const away = o.match.away_team?.toLowerCase() || '';
      const city = o.match.city.toLowerCase();

      return (
        matchNum.includes(q) ||
        home.includes(q) ||
        away.includes(q) ||
        homeEs.includes(q) ||
        awayEs.includes(q) ||
        city.includes(q) ||
        o.match.match_number.toString() === q
      );
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis partidos</h1>
        <p className="text-muted-foreground">
          Gestiona las ofertas de boletos que tienes a la venta
        </p>
      </div>

      <Filters teams={teams} basePath="/partidos" />

      <OffersSection
        offers={filteredOffers}
        matches={matches}
        activeCount={activeCount}
        maxOffers={maxOffers}
      />
    </div>
  );
}
