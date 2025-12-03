-- Pending cards table (temporary queue for card activation)
CREATE TABLE IF NOT EXISTS pending_cards (
  uid TEXT PRIMARY KEY,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  device_id TEXT
);

-- Index for cleanup queries
CREATE INDEX idx_pending_cards_expires ON pending_cards(expires_at);

-- Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pending_cards;

-- Auto-cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cards()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pending_cards WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
