'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

type ContactButtonProps = {
  matchDisplay: string;
  matchNumber: number;
};

const CATEGORY_OPTIONS = ['Cualquiera', ...CATEGORIES] as const;

export function ContactButton({ matchDisplay, matchNumber }: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState('2');
  const [category, setCategory] = useState<string>('Cualquiera');

  function handleSubmit() {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) return;

    const categoryText = category === 'Cualquiera' ? 'cualquier categoría' : category;
    const message = `Hola! Busco ${qty} boleto${qty > 1 ? 's' : ''} para el M${matchNumber} (${matchDisplay}), ${categoryText}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5218139082468?text=${encoded}`, '_blank');
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="hidden sm:inline-flex">
        <MessageCircle className="w-4 h-4 mr-2" />
        Consígueme boletos
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-background border-2 border-black rounded-md shadow-[6px_6px_0_0_#000] p-5">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-1">¿Qué buscas?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Te ayudamos a conseguir boletos para este partido
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Cantidad de boletos
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Categoría
                </label>
                <div className="border-2 border-black rounded-md overflow-hidden">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background text-sm font-medium focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full mt-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
