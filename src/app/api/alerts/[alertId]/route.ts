import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateAlertActive, deleteAlert } from '@/lib/db';

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
    const { active } = await request.json();

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo active requerido' },
        { status: 400 },
      );
    }

    await updateAlertActive(alertId, session.userId, active);

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
