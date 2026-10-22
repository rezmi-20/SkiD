CREATE TABLE IF NOT EXISTS worker_avatar_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_avatar_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_reason text,
  reviewed_by uuid REFERENCES admin_employees(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS worker_avatar_change_one_pending_idx
  ON worker_avatar_change_requests (worker_user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS worker_avatar_change_review_queue_idx
  ON worker_avatar_change_requests (status, created_at DESC);
