'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PremiumOfferWithMatch } from '@/lib/db';
import { getTeamFlag, getTeamNameEs, CATEGORIES, CURRENCIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Check, X, Ticket } from 'lucide-react';
import type { Match } from '@/lib/db';

type OffersTableProps = {
  offers: PremiumOfferWithMatch[];
};

function formatCategory(category: string | null): string {
  if (!category) return '-';
  return category.replace('CAT ', '');
}

function formatMatchTeams(match: Match): string {
  if (match.home_team && match.away_team) {
    const homeFlag = getTeamFlag(match.home_team);
    const homeName = getTeamNameEs(match.home_team);
    const awayFlag = getTeamFlag(match.away_team);
    const awayName = getTeamNameEs(match.away_team);
    const homePart = homeFlag ? `${homeFlag} ${homeName}` : homeName;
    const awayPart = awayFlag ? `${awayFlag} ${awayName}` : awayName;
    return `${homePart} vs ${awayPart}`;
  }
  const home = match.home_placeholder ?? '?';
  const away = match.away_placeholder ?? '?';
  return `${home} vs ${away}`;
}

export function OffersTable({ offers }: OffersTableProps) {
  const router = useRouter();

  const sortedOffers = [...offers].sort((a, b) => {
    const aActive = a.show_in_search || a.notifications_enabled;
    const bActive = b.show_in_search || b.notifications_enabled;
    if (aActive !== bActive) return bActive ? 1 : -1;
    return a.match.match_number - b.match.match_number;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    category: string | null;
    quantity: number;
    pricePerTicket: number;
    currency: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing(offer: PremiumOfferWithMatch) {
    setEditingId(offer.id);
    setEditValues({
      category: offer.category,
      quantity: offer.quantity,
      pricePerTicket: offer.price_per_ticket,
      currency: offer.currency,
    });
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValues(null);
    setError(null);
  }

  async function saveEdit(offerId: string) {
    if (!editValues) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar');
        return;
      }

      setEditingId(null);
      setEditValues(null);
      router.refresh();
    } catch {
      setError('Error de conexion');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(offer: PremiumOfferWithMatch) {
    const newActive = !(offer.show_in_search || offer.notifications_enabled);

    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Ignore
    }
  }

  if (offers.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
        <p className="font-semibold text-muted-foreground">
          No tienes ofertas aun
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea tu primera oferta para empezar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedOffers.map((offer) => {
        const isEditing = editingId === offer.id;
        const isActive = offer.show_in_search || offer.notifications_enabled;

        return (
          <div
            key={offer.id}
            className={`border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] ${
              !isActive ? 'opacity-50' : ''
            }`}
          >
            {/* Main row */}
            <div className="flex items-center gap-3 p-3">
              {/* Match badge */}
              <div className="w-12 shrink-0 rounded border-2 border-black bg-primary px-2 py-0.5 text-center text-xs font-bold">
                M{offer.match.match_number}
              </div>

              {/* Match teams */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {formatMatchTeams(offer.match)}
                </p>
              </div>

              {/* Details - desktop only */}
              {!isEditing && (
                <div className="hidden items-center gap-3 text-sm sm:flex">
                  <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1">
                    <span className="font-bold">Cat {formatCategory(offer.category)}</span>
                    <span className="h-4 w-px bg-black/20" />
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" />
                      <span className="font-semibold">{offer.quantity}</span>
                    </span>
                  </div>
                  <span className="font-bold">
                    ${offer.price_per_ticket.toLocaleString()} {offer.currency}
                  </span>
                </div>
              )}

              {/* Switch - always visible */}
              {!isEditing && (
                <Switch
                  checked={isActive}
                  onCheckedChange={() => toggleActive(offer)}
                />
              )}

              {/* Edit button - desktop only */}
              {!isEditing && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEditing(offer)}
                  className="hidden sm:flex"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Mobile details (non-editing) */}
            {!isEditing && (
              <div className="flex items-center justify-between border-t-2 border-black px-3 py-2 sm:hidden">
                <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm">
                  <span className="font-bold">Cat {formatCategory(offer.category)}</span>
                  <span className="h-3.5 w-px bg-black/20" />
                  <span className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" />
                    <span className="font-semibold">{offer.quantity}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    ${offer.price_per_ticket.toLocaleString()} {offer.currency}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(offer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Edit mode */}
            {isEditing && (
              <div className="border-t-2 border-black p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Cat
                    </p>
                    <Select
                      value={editValues?.category ?? ''}
                      onValueChange={(v) =>
                        setEditValues((prev) =>
                          prev ? { ...prev, category: v || null } : null,
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {formatCategory(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Boletos
                    </p>
                    <Input
                      type="number"
                      min={1}
                      value={editValues?.quantity ?? 1}
                      onChange={(e) =>
                        setEditValues((prev) =>
                          prev
                            ? { ...prev, quantity: parseInt(e.target.value) || 1 }
                            : null,
                        )
                      }
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Precio
                    </p>
                    <Input
                      type="number"
                      min={0}
                      value={editValues?.pricePerTicket ?? 0}
                      onChange={(e) =>
                        setEditValues((prev) =>
                          prev
                            ? {
                                ...prev,
                                pricePerTicket: parseInt(e.target.value) || 0,
                              }
                            : null,
                        )
                      }
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Moneda
                    </p>
                    <Select
                      value={editValues?.currency ?? 'MXN'}
                      onValueChange={(v) =>
                        setEditValues((prev) =>
                          prev ? { ...prev, currency: v } : null,
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((cur) => (
                          <SelectItem key={cur} value={cur}>
                            {cur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="mt-3 rounded border-2 border-black bg-destructive p-2 text-sm font-semibold text-destructive-foreground">
                    {error}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(offer.id)}
                    disabled={saving}
                  >
                    <Check className="mr-1 h-4 w-4" strokeWidth={3} />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <X className="mr-1 h-4 w-4" strokeWidth={3} />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
