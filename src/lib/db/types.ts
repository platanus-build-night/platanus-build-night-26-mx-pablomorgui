export type Match = {
  id: string;
  match_number: number;
  stage: string;
  group_label: string | null;
  home_team: string | null;
  away_team: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  kickoff_at: string;
  venue: string;
  city: string;
};

export type PremiumSeller = {
  id: string;
  phone_number: string;
  seller_name: string;
  notification_group_jid: string | null;
  accepts_trades: boolean;
  active: boolean;
  max_active_offers: number;
};

export type PremiumOffer = {
  id: string;
  premium_seller_id: string;
  match_id: string;
  category: string | null;
  price_per_ticket: number;
  currency: string;
  quantity: number;
  show_in_search: boolean;
  notifications_enabled: boolean;
};

export type PremiumOfferWithMatch = PremiumOffer & { match: Match };
