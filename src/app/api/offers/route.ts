import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createOffer, countActiveOffers, getPremiumSellerById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.premiumSellerId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { matchId, category, quantity, pricePerTicket, currency } =
      await request.json();

    if (!matchId || !category || !quantity || !pricePerTicket || !currency) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 },
      );
    }

    const [activeCount, seller] = await Promise.all([
      countActiveOffers(session.premiumSellerId),
      getPremiumSellerById(session.premiumSellerId),
    ]);

    const maxOffers = seller?.max_active_offers ?? 7;
    const hasUnlimitedPlan = maxOffers === 10;

    if (!hasUnlimitedPlan && activeCount >= maxOffers) {
      return NextResponse.json(
        { error: 'Limite de ofertas alcanzado' },
        { status: 400 },
      );
    }

    const offerId = await createOffer({
      premiumSellerId: session.premiumSellerId,
      matchId,
      category,
      pricePerTicket,
      currency,
      quantity,
    });

    return NextResponse.json({ id: offerId });
  } catch (error) {
    console.error('Create offer error:', error);

    if (error instanceof Error && error.message === 'DUPLICATE') {
      return NextResponse.json(
        { error: 'Ya tienes una oferta para este partido y categoria' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
