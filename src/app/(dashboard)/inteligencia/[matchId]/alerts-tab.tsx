'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PriceAlert } from '@/lib/db/alerts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Bell } from 'lucide-react';

type AlertsTabProps = {
  matchId: string;
  alerts: PriceAlert[];
  userWhatsApp: string | null;
};

const CATEGORIES = [
  { value: 'any', label: 'Cualquier categoria' },
  { value: 'CAT 1', label: 'Cat 1' },
  { value: 'CAT 2', label: 'Cat 2' },
  { value: 'CAT 3', label: 'Cat 3' },
];

export function AlertsTab({ matchId, alerts, userWhatsApp }: AlertsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('any');
  const [maxPrice, setMaxPrice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsWhatsApp = !userWhatsApp;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          category: category === 'any' ? null : category,
          maxPrice: price,
          whatsappNumber: needsWhatsApp ? whatsapp.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear alerta');
        return;
      }

      setShowForm(false);
      setCategory('any');
      setMaxPrice('');
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
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="maxPrice">Umbral de precio (USD)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min={1}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="500"
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
            {maxPrice && parseInt(maxPrice) > 0 && (
              <div className="rounded border-2 border-black bg-secondary px-3 py-2 text-sm">
                <span className="font-semibold">Regla: </span>
                {category === 'any' ? (
                  <>Notificarme cuando se publiquen boletos de cualquier categoría en menos de <strong>${maxPrice} USD</strong></>
                ) : (
                  <>Notificarme cuando se publiquen boletos <strong>{category}</strong> en menos de <strong>${maxPrice} USD</strong></>
                )}
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
      {alerts.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-black bg-muted p-8 text-center">
          <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-muted-foreground">
            No tienes alertas para este partido
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una alerta para recibir notificaciones cuando el precio baje
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold">Tus alertas para este partido</h3>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 border-black rounded-md bg-background shadow-[3px_3px_0_0_#000] p-3 flex items-center justify-between ${
                !alert.active ? 'opacity-50' : ''
              }`}
            >
              <div className="text-sm">
                {alert.category ? (
                  <><strong>{alert.category}</strong> en menos de <strong>${alert.max_price} USD</strong></>
                ) : (
                  <>Cualquier categoría en menos de <strong>${alert.max_price} USD</strong></>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
}
