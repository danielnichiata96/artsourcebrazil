-- Migration: Add reported flag to jobs
-- Created: 2025-11-24
-- Description: Adds a flag to mark jobs that have been reported by users (free QA)

-- Add reported column to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS reported BOOLEAN DEFAULT FALSE;

-- Add reported_at timestamp to track when it was reported
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ;

-- Add reported_reason to store the reason (optional)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS reported_reason TEXT;

-- Create index for querying reported jobs
CREATE INDEX IF NOT EXISTS idx_jobs_reported ON jobs(reported) WHERE reported = TRUE;

-- Comment for documentation
COMMENT ON COLUMN jobs.reported IS 'Flag indicating if job has been reported by users';
COMMENT ON COLUMN jobs.reported_at IS 'Timestamp when job was first reported';
COMMENT ON COLUMN jobs.reported_reason IS 'Reason provided by user for reporting (e.g., link broken, job closed)';

