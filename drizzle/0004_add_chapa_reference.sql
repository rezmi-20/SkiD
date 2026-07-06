-- Stores the Chapa internal reference ID returned by the verify API.
-- Used to construct the receipt URL: https://chapa.link/payment-receipt/{chapa_reference}
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS chapa_reference text;
