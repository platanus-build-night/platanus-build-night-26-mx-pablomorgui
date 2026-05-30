'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Match } from '@/lib/db';
import { formatMatchDisplay, CATEGORIES, CURRENCIES } from '@/lib/constants';
import { Modal } from '@/components/ui/modal';
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
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';

type NewOfferModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: Match[];
};

function formatCategory(category: string): string {
  return category.replace('CAT ', '');
}

export function NewOfferModal({
  open,
  onOpenChange,
  matches,
}: NewOfferModalProps) {
  const router = useRouter();
  const [matchId, setMatchId] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pricePerTicket, setPricePerTicket] = useState('');
  const [currency, setCurrency] = useState('MXN');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const matchOptions: ComboboxOption[] = matches.map((m) => ({
    value: m.id,
    label: formatMatchDisplay(m),
    searchTerms: [
      m.home_team,
      m.away_team,
      m.home_placeholder,
      m.away_placeholder,
      `M${m.match_number}`,
      m.match_number.toString(),
    ]
      .filter(Boolean)
      .join(' '),
  }));

  function resetForm() {
    setMatchId('');
    setCategory('');
    setQuantity('1');
    setPricePerTicket('');
    setCurrency('MXN');
    setError(null);
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!matchId) {
      setError('Selecciona un partido');
      return;
    }

    if (!category) {
      setError('Selecciona una categoria');
      return;
    }

    const qty = parseInt(quantity) || 0;
    if (qty < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    const price = parseInt(pricePerTicket) || 0;
    if (price < 1) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          category,
          quantity: qty,
          pricePerTicket: price,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear oferta');
        return;
      }

      handleClose(false);
      router.refresh();
    } catch {
      setError('Error de conexion');
    } finally {
      setSaving(false);
    }
  }

  const selectedMatch = matches.find((m) => m.id === matchId);

  return (
    <Modal open={open} onOpenChange={handleClose} title="Nueva oferta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Match selector */}
        <div className="space-y-1.5">
          <Label>Partido</Label>
          <Combobox
            options={matchOptions}
            value={matchId}
            onValueChange={setMatchId}
            placeholder="Buscar partido..."
            searchPlaceholder="Ej: Mexico, Argentina, M25..."
            emptyText="No se encontro el partido"
          />
          {selectedMatch && (
            <p className="text-xs text-muted-foreground">
              {selectedMatch.venue}, {selectedMatch.city}
            </p>
          )}
        </div>

        {/* Category and Quantity row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
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

          <div className="space-y-1.5">
            <Label htmlFor="quantity">Boletos</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        {/* Price row */}
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio por boleto</Label>
          <div className="flex gap-2">
            <Input
              id="price"
              type="number"
              min={1}
              value={pricePerTicket}
              onChange={(e) => setPricePerTicket(e.target.value)}
              placeholder="0"
              className="flex-1"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
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
          <div className="border-2 border-black bg-destructive p-2.5 text-sm font-semibold text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Guardando...' : 'Agregar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
