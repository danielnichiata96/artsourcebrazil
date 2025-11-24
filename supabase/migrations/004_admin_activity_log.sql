-- Migration: Admin activity log table
-- Created: 2025-11-24
-- Description: Tracks administrative actions (approve/reject/update drafts)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  draft_id UUID,
  job_id TEXT,
  admin_identifier TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_draft ON admin_activity_log(draft_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);

ALTER TABLE job_drafts
ADD COLUMN IF NOT EXISTS last_admin_edit_at TIMESTAMPTZ;
