import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Nav } from '@/components/nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Nav userName={session.name} isSeller={session.role === 'seller' || session.role === 'both'} />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6">{children}</main>
    </div>
  );
}
