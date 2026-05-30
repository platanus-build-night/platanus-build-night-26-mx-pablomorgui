-- Tabla de alertas de precio
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL REFERENCES matches(id),
  category TEXT CHECK (category IN ('CAT 1', 'CAT 2', 'CAT 3')),  -- null = cualquier categoría
  max_price INTEGER NOT NULL,  -- precio máximo en USD
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_triggered_at TIMESTAMPTZ,  -- para no spamear

  UNIQUE(user_id, match_id, category)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_match ON price_alerts(match_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(active) WHERE active = true;
