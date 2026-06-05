import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createSupplier } from '@/lib/db';

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

  const { phoneNumber, name, defaultCurrency } = body;

  if (!phoneNumber) {
    return NextResponse.json(
      { error: 'El teléfono es requerido' },
      { status: 400 },
    );
  }

  try {
    const supplier = await createSupplier({
      phoneNumber,
      name: name || null,
      defaultCurrency: defaultCurrency || null,
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Error al crear proveedor' },
      { status: 500 },
    );
  }
}
