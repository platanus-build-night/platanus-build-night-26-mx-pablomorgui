'use client';

import Link from 'next/link';

type TabSwitcherProps = {
  activeTab: 'precios' | 'alertas';
  matchId: string;
};

export function TabSwitcher({ activeTab, matchId }: TabSwitcherProps) {
  return (
    <div className="border-b-2 border-black mb-6 sm:mb-8">
      <div className="flex">
        <Link
          href={`/inteligencia/${matchId}?tab=precios`}
          className={`px-4 py-2 font-semibold -mb-[2px] ${
            activeTab === 'precios'
              ? 'border-b-4 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Precios
        </Link>
        <Link
          href={`/inteligencia/${matchId}?tab=alertas`}
          className={`px-4 py-2 font-semibold -mb-[2px] ${
            activeTab === 'alertas'
              ? 'border-b-4 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Alertas
        </Link>
      </div>
    </div>
  );
}
