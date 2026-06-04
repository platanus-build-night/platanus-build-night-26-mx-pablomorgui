import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateAlertActive, updateAlert, deleteAlert } from '@/lib/db';

type RouteContext = {
  params: Promise<{ alertId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { alertId } = await context.params;
    const body = await request.json();

    // Toggle active only
    if (typeof body.active === 'boolean' && Object.keys(body).length === 1) {
      await updateAlertActive(alertId, session.userId, body.active);
      return NextResponse.json({ success: true });
    }

    // Full edit
    const { category, maxPrice, minQuantity } = body;

    if (maxPrice !== undefined && (typeof maxPrice !== 'number' || maxPrice < 1)) {
      return NextResponse.json(
        { error: 'El precio debe ser mayor a 0' },
        { status: 400 },
      );
    }

    if (minQuantity !== undefined && minQuantity !== null && (typeof minQuantity !== 'number' || minQuantity < 1)) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 },
      );
    }

    await updateAlert(alertId, session.userId, {
      category: category !== undefined ? (category || null) : undefined,
      maxPrice,
      minQuantity: minQuantity !== undefined ? (minQuantity || null) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { alertId } = await context.params;

    await deleteAlert(alertId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
