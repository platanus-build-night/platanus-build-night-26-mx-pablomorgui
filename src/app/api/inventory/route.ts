import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createInventoryItem } from '@/lib/db';

const ALLOWED_EMAIL = 'parcerosmundialin@gmail.com';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();

  const {
    supplierId,
    matchId,
    category,
    block,
    row,
    quantity,
    pricePerTicket,
    salePrice,
    currency,
    notes,
  } = body;

  if (!supplierId || !matchId || !quantity || !pricePerTicket || !currency) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos' },
      { status: 400 },
    );
  }

  try {
    const id = await createInventoryItem({
      supplierId,
      matchId,
      category: category || null,
      block: block || null,
      row: row || null,
      quantity,
      pricePerTicket,
      salePrice: salePrice || null,
      currency,
      notes: notes || null,
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Error al crear registro' },
      { status: 500 },
    );
  }
}
