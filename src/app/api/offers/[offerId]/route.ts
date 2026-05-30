import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateOffer, getOfferById } from '@/lib/db';

type RouteContext = {
  params: Promise<{ offerId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session || !session.premiumSellerId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { offerId } = await context.params;

    const offer = await getOfferById(offerId, session.premiumSellerId);
    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    const body = await request.json();

    await updateOffer(offerId, session.premiumSellerId, {
      category: body.category,
      pricePerTicket: body.pricePerTicket,
      currency: body.currency,
      quantity: body.quantity,
      active: body.active,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update offer error:', error);

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
