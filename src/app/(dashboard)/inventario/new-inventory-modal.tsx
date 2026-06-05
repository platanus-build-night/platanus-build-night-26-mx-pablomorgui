'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Supplier, Match } from '@/lib/db';
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
import { NewSupplierModal } from './new-supplier-modal';

type NewInventoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  matches: Match[];
  onSupplierCreated: (supplier: Supplier) => void;
};

function formatCategory(category: string): string {
  return category.replace('CAT ', '');
}

export function NewInventoryModal({
  open,
  onOpenChange,
  suppliers,
  matches,
  onSupplierCreated,
}: NewInventoryModalProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState('');
  const [matchId, setMatchId] = useState('');
  const [category, setCategory] = useState('');
  const [block, setBlock] = useState('');
  const [row, setRow] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pricePerTicket, setPricePerTicket] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [currency, setCurrency] = useState('MXN');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);

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
    setSupplierId('');
    setMatchId('');
    setCategory('');
    setBlock('');
    setRow('');
    setQuantity('1');
    setPricePerTicket('');
    setSalePrice('');
    setCurrency('MXN');
    setNotes('');
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

    if (!supplierId) {
      setError('Selecciona un proveedor');
      return;
    }

    if (!matchId) {
      setError('Selecciona un partido');
      return;
    }

    const qty = parseInt(quantity) || 0;
    if (qty < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    const price = parseInt(pricePerTicket) || 0;
    if (price < 1) {
      setError('El precio de compra debe ser mayor a 0');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          matchId,
          category: category || null,
          block: block || null,
          row: row || null,
          quantity: qty,
          pricePerTicket: price,
          salePrice: salePrice ? parseInt(salePrice) : null,
          currency,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear registro');
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
    <Modal open={open} onOpenChange={handleClose} title="Nuevo registro de inventario">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier selector */}
        <div className="space-y-1.5">
          <Label>Proveedor</Label>
          <div className="flex gap-2">
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name || supplier.phone_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="px-3"
              onClick={() => setShowNewSupplier(true)}
            >
              +
            </Button>
          </div>
        </div>

        <NewSupplierModal
          open={showNewSupplier}
          onOpenChange={setShowNewSupplier}
          onSupplierCreated={(supplier) => {
            onSupplierCreated(supplier);
            setSupplierId(supplier.id);
          }}
        />

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

        {/* Category, Block, Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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

          <div className="space-y-1.5">
            <Label htmlFor="block">Bloque</Label>
            <Input
              id="block"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              placeholder="-"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="row">Fila</Label>
            <Input
              id="row"
              value={row}
              onChange={(e) => setRow(e.target.value)}
              placeholder="-"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Cantidad de boletos</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pricePerTicket">Precio de compra</Label>
            <Input
              id="pricePerTicket"
              type="number"
              min={1}
              value={pricePerTicket}
              onChange={(e) => setPricePerTicket(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salePrice">Precio de venta</Label>
            <Input
              id="salePrice"
              type="number"
              min={0}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <Label>Moneda</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full">
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

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
          />
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
