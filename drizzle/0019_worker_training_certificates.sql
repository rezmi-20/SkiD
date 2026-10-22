CREATE TABLE IF NOT EXISTS worker_training_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name varchar(180) NOT NULL,
  mime_type varchar(100) NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0 AND file_size <= 1048576),
  document_data_url text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS worker_training_certificates_worker_idx
  ON worker_training_certificates(worker_user_id);
