'use client';

import { useState } from 'react';
import type { Supplier } from '@/lib/db';
import { CURRENCIES } from '@/lib/constants';
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

type NewSupplierModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated: (supplier: Supplier) => void;
};

export function NewSupplierModal({
  open,
  onOpenChange,
  onSupplierCreated,
}: NewSupplierModalProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setName('');
    setPhoneNumber('');
    setDefaultCurrency('');
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

    if (!phoneNumber.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          name: name.trim() || null,
          defaultCurrency: defaultCurrency || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear proveedor');
        return;
      }

      onSupplierCreated(data.supplier);
      handleClose(false);
    } catch {
      setError('Error de conexion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={handleClose} title="Nuevo proveedor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="supplierName">Nombre</Label>
          <Input
            id="supplierName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Teléfono</Label>
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ej: +52 55 1234 5678"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Moneda por defecto</Label>
          <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Opcional" />
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

        {error && (
          <div className="border-2 border-black bg-destructive p-2.5 text-sm font-semibold text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear proveedor'}
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
