import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateInventoryItem, deleteInventoryItem } from '@/lib/db';

const ALLOWED_EMAIL = 'parcerosmundialin@gmail.com';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();

  try {
    await updateInventoryItem(id, {
      category: body.category,
      block: body.block,
      row: body.row,
      quantity: body.quantity,
      pricePerTicket: body.pricePerTicket,
      salePrice: body.salePrice,
      currency: body.currency,
      notes: body.notes,
      active: body.active,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Error al actualizar registro' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await deleteInventoryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar registro' },
      { status: 500 },
    );
  }
}
