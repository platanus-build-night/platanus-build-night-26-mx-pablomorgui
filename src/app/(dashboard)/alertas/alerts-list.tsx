'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PriceAlertWithMatch } from '@/lib/db/alerts';
import type { Match } from '@/lib/db/types';
import { getTeamFlag, getTeamNameEs, formatMatchDisplay } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Trash2, Pencil, X, Check, Plus } from 'lucide-react';

const CATEGORIES = [
  { value: 'any', label: 'Cualquier categoria' },
  { value: 'CAT 1', label: 'Cat 1' },
  { value: 'CAT 2', label: 'Cat 2' },
  { value: 'CAT 3', label: 'Cat 3' },
];

type AlertsListProps = {
  alerts: PriceAlertWithMatch[];
  matches: Match[];
  userWhatsApp: string | null;
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

function formatAlertRule(alert: PriceAlertWithMatch): React.ReactNode {
  const parts: React.ReactNode[] = [];
  if (alert.category) {
    parts.push(<strong key="cat">{alert.category}</strong>);
  } else {
    parts.push('Cualquier categoría');
  }
  if (alert.min_quantity) {
    parts.push(', mínimo ', <strong key="qty">{alert.min_quantity} boletos</strong>);
  }
  parts.push(', menos de ', <strong key="price">${alert.max_price} USD</strong>);
  return <>{parts}</>;
}

export function AlertsList({ alerts, matches, userWhatsApp }: AlertsListProps) {
  const router = useRouter();

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [category, setCategory] = useState('any');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('any');
  const [editMaxPrice, setEditMaxPrice] = useState('');
  const [editMinQuantity, setEditMinQuantity] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const needsWhatsApp = !userWhatsApp;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedMatchId) {
      setError('Selecciona un partido');
      return;
    }

    const price = parseInt(maxPrice);
    if (!price || price < 1) {
      setError('Ingresa un precio valido');
      return;
    }

    if (needsWhatsApp && !whatsapp.trim()) {
      setError('Ingresa tu numero de WhatsApp');
      return;
    }

    setSaving(true);

    try {
      const qty = minQuantity ? parseInt(minQuantity) : null;
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatchId,
          category: category === 'any' ? null : category,
          maxPrice: price,
          minQuantity: qty,
          whatsappNumber: needsWhatsApp ? whatsapp.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear alerta');
        return;
      }

      setShowForm(false);
      setSelectedMatchId('');
      setCategory('any');
      setMaxPrice('');
      setMinQuantity('');
      setWhatsapp('');
      router.refresh();
    } catch {
      setError('Error de conexion');
    } finally {
      setSaving(false);
    }
  }

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

  function startEdit(alert: PriceAlertWithMatch) {
    setEditingId(alert.id);
    setEditCategory(alert.category ?? 'any');
    setEditMaxPrice(String(alert.max_price));
    setEditMinQuantity(alert.min_quantity ? String(alert.min_quantity) : '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(alertId: string) {
    const price = parseInt(editMaxPrice);
    if (!price || price < 1) return;

    setEditSaving(true);
    try {
      const qty = editMinQuantity ? parseInt(editMinQuantity) : null;
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editCategory === 'any' ? null : editCategory,
          maxPrice: price,
          minQuantity: qty,
        }),
      });
      setEditingId(null);
      router.refresh();
    } catch {
      // Ignore
    } finally {
      setEditSaving(false);
    }
  }

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="space-y-6">
      {/* New alert button/form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={3} />
          Nueva alerta
        </Button>
      ) : (
        <div className="border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] p-4">
          <h3 className="font-bold mb-4">Nueva alerta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Match selector */}
            <div className="space-y-1.5">
              <Label>Partido</Label>
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un partido" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {formatMatchDisplay(match)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxPrice">Precio máximo (USD)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min={1}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="minQuantity">Mínimo boletos</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  min={1}
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            {needsWhatsApp && (
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">Tu numero de WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+52 55 1234 5678"
                />
                <p className="text-xs text-muted-foreground">
                  Incluye el codigo de pais. Aqui te enviaremos las alertas.
                </p>
              </div>
            )}

            {/* Preview de la regla */}
            {selectedMatch && maxPrice && parseInt(maxPrice) > 0 && (
              <div className="rounded border-2 border-black bg-secondary px-3 py-2 text-sm">
                <span className="font-semibold">Regla: </span>
                Notificarme cuando se publiquen boletos para <strong>M{selectedMatch.match_number}</strong>
                {category !== 'any' && <> <strong>{category}</strong></>}
                {minQuantity && parseInt(minQuantity) > 0 && <>, mínimo <strong>{minQuantity} boletos</strong></>}
                , en menos de <strong>${maxPrice} USD</strong>
              </div>
            )}

            {error && (
              <div className="rounded border-2 border-black bg-destructive p-2 text-sm font-semibold text-destructive-foreground">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear alerta'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Existing alerts */}
      {alerts.length === 0 && !showForm ? (
        <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
          <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-muted-foreground">
            No tienes alertas configuradas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una alerta para recibir notificaciones cuando el precio baje
          </p>
        </div>
      ) : alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 border-black rounded-md bg-background shadow-[4px_4px_0_0_#000] p-4 ${
                !alert.active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/inteligencia/${alert.match_id}`}
                  className="hover:underline"
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded border-2 border-black bg-primary px-2 py-0.5 text-xs font-bold">
                      M{alert.match.match_number}
                    </span>
                    <span className="font-semibold truncate">
                      {formatMatchTeams(alert.match)}
                    </span>
                  </div>
                </Link>
              </div>

              {editingId === alert.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={editMaxPrice}
                      onChange={(e) => setEditMaxPrice(e.target.value)}
                      placeholder="Precio USD"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={editMinQuantity}
                      onChange={(e) => setEditMinQuantity(e.target.value)}
                      placeholder="Min boletos"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(alert.id)}
                      disabled={editSaving}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={editSaving}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {formatAlertRule(alert)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(alert)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
