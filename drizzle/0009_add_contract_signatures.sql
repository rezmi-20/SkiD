CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL,
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT contract_signatures_contract_role_unique UNIQUE (contract_id, role)
);

CREATE INDEX IF NOT EXISTS contract_signature_contract_idx
ON contract_signatures(contract_id);

CREATE INDEX IF NOT EXISTS contract_signature_user_idx
ON contract_signatures(user_id);
