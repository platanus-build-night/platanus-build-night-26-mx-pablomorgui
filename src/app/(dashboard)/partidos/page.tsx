import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getOffersBySeller, countActiveOffers, getPremiumSellerById, getAllMatches } from '@/lib/db';
import { OffersSection } from './offers-section';

export default async function PartidosPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis partidos</h1>
        <p className="text-muted-foreground">
          Gestiona las ofertas de boletos que tienes a la venta
        </p>
      </div>

      <OffersSection
        offers={offers}
        matches={matches}
        activeCount={activeCount}
        maxOffers={maxOffers}
      />
    </div>
  );
}
