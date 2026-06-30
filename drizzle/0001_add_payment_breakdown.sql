ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS commission_amount integer,
  ADD COLUMN IF NOT EXISTS net_amount integer;
