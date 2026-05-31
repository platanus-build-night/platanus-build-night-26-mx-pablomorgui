'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupplierInventoryWithDetails, Supplier, Match } from '@/lib/db';
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
import { Pencil, Check, X, ArrowRight } from 'lucide-react';

type InventoryTableProps = {
  inventory: SupplierInventoryWithDetails[];
  suppliers: Supplier[];
  matches: Match[];
};

function formatCategory(category: string | null): string {
  if (!category) return '-';
  return category.replace('CAT ', '');
}

function MatchTeams({ match }: { match: Match }) {
  if (match.home_team && match.away_team) {
    const homeFlag = getTeamFlag(match.home_team);
    const homeName = getTeamNameEs(match.home_team);
    const awayFlag = getTeamFlag(match.away_team);
    const awayName = getTeamNameEs(match.away_team);
    return (
      <>
        {homeFlag && <span className="mr-1">{homeFlag}</span>}
        <span>{homeName}</span>
        <span className="mx-1 text-muted-foreground">vs</span>
        {awayFlag && <span className="mr-1">{awayFlag}</span>}
        <span>{awayName}</span>
      </>
    );
  }
  const home = match.home_placeholder ?? '?';
  const away = match.away_placeholder ?? '?';
  return <>{home} vs {away}</>;
}

function formatPrice(price: number | null): string {
  if (price == null) return '-';
  return `$${price.toLocaleString()}`;
}

type EditValues = {
  category: string | null;
  block: string | null;
  row: string | null;
  quantity: number;
  pricePerTicket: number | null;
  salePrice: number | null;
  currency: string;
  notes: string | null;
};

export function InventoryTable({ inventory }: InventoryTableProps) {
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing(item: SupplierInventoryWithDetails) {
    setEditingId(item.id);
    setEditValues({
      category: item.category,
      block: item.block,
      row: item.row,
      quantity: item.quantity,
      pricePerTicket: item.price_per_ticket,
      salePrice: item.sale_price,
      currency: item.currency,
      notes: item.notes,
    });
    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValues(null);
    setError(null);
  }

  async function saveEdit(itemId: string) {
    if (!editValues) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
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

  async function toggleActive(item: SupplierInventoryWithDetails) {
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Ignore
    }
  }

  if (inventory.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
        <p className="font-semibold text-muted-foreground">
          No hay registros en el inventario
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrega tu primer registro para empezar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inventory.map((item) => {
        const isEditing = editingId === item.id;
        const location = [
          item.category ? `Cat ${formatCategory(item.category)}` : null,
          item.block ? `Bloque ${item.block}` : null,
          item.row ? `Fila ${item.row}` : null,
        ].filter(Boolean).join(' · ');

        return (
          <div
            key={item.id}
            onClick={() => !isEditing && router.push(`/inteligencia/${item.match.id}`)}
            className={`rounded-lg border-2 border-black bg-background shadow-[4px_4px_0_0_#000] ${
              !isEditing ? 'cursor-pointer hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all' : ''
            }`}
          >
            <div className="p-3">
              {/* Desktop layout */}
              <div className="hidden sm:block">
                {/* Header row: Partido + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded border-2 border-black bg-primary px-1.5 py-px text-xs font-bold">
                      M{item.match.match_number}
                    </span>
                    <span className="truncate text-sm font-semibold">
                      <MatchTeams match={item.match} />
                    </span>
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={item.active}
                          onCheckedChange={() => toggleActive(item)}
                        />
                        <span className="text-xs text-muted-foreground">Activo</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                        className="h-7 px-2 text-xs"
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Data row */}
                {!isEditing && (
                  <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Ubicación</p>
                      <p className="font-semibold">{location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Boletos</p>
                      <p className="font-semibold">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Precio</p>
                      <p className="flex items-center gap-1 font-semibold">
                        <span className="font-normal text-muted-foreground">{formatPrice(item.price_per_ticket)}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-green-700">{formatPrice(item.sale_price)}</span>
                        <span className="text-xs font-normal text-muted-foreground">{item.currency}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Proveedor</p>
                      <p className="truncate font-semibold">{item.supplier.name || item.supplier.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="rounded border-2 border-black bg-primary px-1.5 py-px text-xs font-bold">
                    M{item.match.match_number}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    <MatchTeams match={item.match} />
                  </span>
                </div>

                {!isEditing && (
                  <>
                    <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Ubicación</p>
                        <p className="text-sm font-semibold">{location || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Boletos</p>
                        <p className="text-sm font-semibold">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Precio</p>
                        <p className="flex items-center gap-1 text-sm font-semibold">
                          <span>{formatPrice(item.price_per_ticket)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-700">{formatPrice(item.sale_price)}</span>
                          <span className="text-xs font-normal text-muted-foreground">{item.currency}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Proveedor</p>
                        <p className="truncate text-sm font-semibold">
                          {item.supplier.name || item.supplier.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={item.active}
                          onCheckedChange={() => toggleActive(item)}
                        />
                        <span className="text-xs text-muted-foreground">Activo</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                        className="h-7 px-2 text-xs"
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Edit mode */}
              {isEditing && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Categoría
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
                          <SelectValue placeholder="-" />
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
                        Bloque
                      </p>
                      <Input
                        value={editValues?.block ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) =>
                            prev ? { ...prev, block: e.target.value || null } : null,
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="-"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Fila
                      </p>
                      <Input
                        value={editValues?.row ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) =>
                            prev ? { ...prev, row: e.target.value || null } : null,
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="-"
                      />
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
                        P. Compra
                      </p>
                      <Input
                        type="number"
                        min={0}
                        value={editValues?.pricePerTicket ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  pricePerTicket: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                }
                              : null,
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="-"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        P. Venta
                      </p>
                      <Input
                        type="number"
                        min={0}
                        value={editValues?.salePrice ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  salePrice: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                }
                              : null,
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="-"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Notas
                      </p>
                      <Input
                        value={editValues?.notes ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) =>
                            prev ? { ...prev, notes: e.target.value || null } : null,
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded border-2 border-black bg-destructive p-2 text-sm font-semibold text-destructive-foreground">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(item.id)}
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
          </div>
        );
      })}
    </div>
  );
}
