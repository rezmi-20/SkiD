CREATE TABLE IF NOT EXISTS community_post_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('useful', 'not_useful')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_post_votes_user_post_unique UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS community_post_votes_post_type_idx
  ON community_post_votes (post_id, vote_type);
