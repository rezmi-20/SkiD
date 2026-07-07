-- ============================================================
-- DireSkill Migration: Add is_suspended to users table
-- Run this once against your Neon PostgreSQL database.
-- ============================================================

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'is_suspended';
