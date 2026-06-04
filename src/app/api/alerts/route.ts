import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createAlert, updateUserWhatsApp } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { matchId, category, maxPrice, minQuantity, whatsappNumber } = await request.json();

    if (!matchId || !maxPrice) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 },
      );
    }

    if (maxPrice < 1) {
      return NextResponse.json(
        { error: 'El precio debe ser mayor a 0' },
        { status: 400 },
      );
    }

    if (minQuantity !== undefined && minQuantity !== null && minQuantity < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 },
      );
    }

    if (whatsappNumber) {
      await updateUserWhatsApp(session.userId, whatsappNumber);
    }

    const alertId = await createAlert({
      userId: session.userId,
      matchId,
      category: category || null,
      maxPrice,
      minQuantity: minQuantity || null,
    });

    return NextResponse.json({ id: alertId });
  } catch (error) {
    console.error('Create alert error:', error);

    if (error instanceof Error && error.message === 'DUPLICATE') {
      return NextResponse.json(
        { error: 'Ya tienes una alerta para este partido y categoria' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
