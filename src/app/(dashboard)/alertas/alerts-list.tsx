'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PriceAlertWithMatch } from '@/lib/db/alerts';
import { getTeamFlag, getTeamNameEs } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Trash2 } from 'lucide-react';

type AlertsListProps = {
  alerts: PriceAlertWithMatch[];
};

function formatMatchTeams(match: PriceAlertWithMatch['match']): string {
  if (match.home_team && match.away_team) {
    const homeFlag = getTeamFlag(match.home_team);
    const homeName = getTeamNameEs(match.home_team);
    const awayFlag = getTeamFlag(match.away_team);
    const awayName = getTeamNameEs(match.away_team);
    return `${homeFlag} ${homeName} vs ${awayFlag} ${awayName}`;
  }
  return `${match.home_placeholder ?? '?'} vs ${match.away_placeholder ?? '?'}`;
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter();

  async function toggleActive(alertId: string, active: boolean) {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      router.refresh();
    } catch {
      // Ignore
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      // Ignore
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
        <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-semibold text-muted-foreground">
          No tienes alertas configuradas
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ve a un partido en Inteligencia y crea tu primera alerta
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] p-4 ${
            !alert.active ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href={`/inteligencia/${alert.match_id}`}
                className="hover:underline"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="shrink-0 rounded border-2 border-black bg-primary px-2 py-0.5 text-xs font-bold">
                    M{alert.match.match_number}
                  </span>
                  <span className="font-semibold truncate">
                    {formatMatchTeams(alert.match)}
                  </span>
                </div>
              </Link>
              <div className="text-sm text-muted-foreground">
                {alert.category ? (
                  <><strong className="text-foreground">{alert.category}</strong> en menos de <strong className="text-foreground">${alert.max_price} USD</strong></>
                ) : (
                  <>Cualquier categoría en menos de <strong className="text-foreground">${alert.max_price} USD</strong></>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={alert.active}
                onCheckedChange={(checked) => toggleActive(alert.id, checked)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteAlert(alert.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
