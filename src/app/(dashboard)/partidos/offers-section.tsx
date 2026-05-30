'use client';

import { useState } from 'react';
import type { PremiumOfferWithMatch, Match } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OffersTable } from './offers-table';
import { NewOfferModal } from './new-offer-modal';

type OffersSectionProps = {
  offers: PremiumOfferWithMatch[];
  matches: Match[];
  activeCount: number;
  maxOffers: number;
};

export function OffersSection({
  offers,
  matches,
  activeCount,
  maxOffers,
}: OffersSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState(false);
  const hasUnlimitedPlan = maxOffers === 10;
  const canAddMore = hasUnlimitedPlan || activeCount < maxOffers;

  function handleNewOffer() {
    if (canAddMore) {
      setModalOpen(true);
      setLimitMessage(false);
    } else {
      setLimitMessage(true);
    }
  }

  return (
    <>
      {/* Header bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Mis ofertas</h2>
          <span className="rounded border-2 border-black bg-muted px-2 py-0.5 text-sm font-semibold">
            {hasUnlimitedPlan ? `${activeCount} activas` : `${activeCount}/${maxOffers} activas`}
          </span>
        </div>

        <Button onClick={handleNewOffer}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={3} />
          Nueva oferta
        </Button>
      </div>

      {limitMessage && (
        <div className="mb-4 rounded border-2 border-black bg-secondary p-3 text-sm font-semibold">
          Alcanzaste el maximo de ofertas. Para agregar mas, comentanos en tu grupo con Mundialin.
        </div>
      )}

      {/* Offers list */}
      <OffersTable offers={offers} />

      {/* New offer modal */}
      <NewOfferModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        matches={matches}
      />
    </>
  );
}
