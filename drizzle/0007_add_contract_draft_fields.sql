ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS materials_responsibility TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE contracts c
SET
  job_title = COALESCE(c.job_title, j.title),
  job_description = COALESCE(c.job_description, j.description),
  payment_amount = COALESCE(c.payment_amount, j.budget),
  updated_at = NOW()
FROM jobs j
WHERE c.job_id = j.id
  AND (
    c.job_title IS NULL
    OR c.job_description IS NULL
    OR c.payment_amount IS NULL
  );
