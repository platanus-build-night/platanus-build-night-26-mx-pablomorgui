'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, Bell, Ticket, LogOut } from 'lucide-react';

type NavProps = {
  userName: string;
  isSeller: boolean;
};

const navItems = [
  { href: '/inteligencia', label: 'Inteligencia', icon: BarChart3, requiresSeller: false },
  { href: '/partidos', label: 'Mis partidos', icon: Ticket, requiresSeller: true },
  { href: '/alertas', label: 'Alertas', icon: Bell, requiresSeller: false },
];

export function Nav({ userName, isSeller }: NavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.requiresSeller || isSeller,
  );

  return (
    <header className="border-b-3 border-black bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/inteligencia" className="border-2 border-black bg-primary px-3 py-1 shadow-[3px_3px_0_0_#000]">
            <span className="text-lg font-bold uppercase tracking-tight">Mundialin</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {visibleItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium sm:block">
            Hola, <span className="font-semibold">{userName}</span>
          </span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile bottom nav - fixed at bottom like native apps */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t-2 border-black bg-background pb-[env(safe-area-inset-bottom)] sm:hidden">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1 text-[11px] font-semibold',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
