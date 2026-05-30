import { getSession } from '@/lib/auth';
import { getAlertsByUser } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AlertsList } from './alerts-list';

export default async function AlertasPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const alerts = await getAlertsByUser(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis alertas</h1>
        <p className="text-muted-foreground">
          Recibe notificaciones cuando el precio baje de tu limite
        </p>
      </div>

      <AlertsList alerts={alerts} />
    </div>
  );
}
