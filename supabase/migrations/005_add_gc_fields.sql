-- Migration: Add Garbage Collection and Raw Description Fields
-- Created: 2025-11-25
-- Description: Adds fields to track sync sessions for garbage collection
--              and stores raw description as backup

-- ============================================================================
-- ADD FIELDS TO JOBS TABLE
-- ============================================================================

ALTER TABLE jobs
  ADD COLUMN sync_id UUID,
  ADD COLUMN last_synced_at TIMESTAMPTZ,
  ADD COLUMN closed_at TIMESTAMPTZ,
  ADD COLUMN raw_description TEXT;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN jobs.sync_id IS 'UUID of the sync session that last processed this job';
COMMENT ON COLUMN jobs.last_synced_at IS 'Timestamp when this job was last seen/synced from the source';
COMMENT ON COLUMN jobs.closed_at IS 'Timestamp when this job was marked as closed (for GC tracking)';
COMMENT ON COLUMN jobs.raw_description IS 'Original unprocessed description from ATS (backup)';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for finding jobs by sync_id (used in GC process)
CREATE INDEX idx_jobs_sync_id ON jobs(sync_id);

-- Index for finding stale jobs (used in GC with grace period)
CREATE INDEX idx_jobs_last_synced_at ON jobs(last_synced_at DESC);

-- Composite index for efficient GC queries (status + last_synced_at)
CREATE INDEX idx_jobs_status_last_synced ON jobs(status, last_synced_at);

-- Composite index for company-specific GC queries
CREATE INDEX idx_jobs_company_status_sync ON jobs(company_id, status, sync_id);

-- ============================================================================
-- UPDATE EXISTING ROWS
-- ============================================================================

-- Set last_synced_at to created_at for existing rows
-- This ensures they won't be immediately garbage collected
UPDATE jobs
SET last_synced_at = created_at
WHERE last_synced_at IS NULL;

-- ============================================================================
-- NOTES
-- ============================================================================

-- GC Strategy Options:
-- 
-- 1. Immediate GC (sync_id based):
--    Close jobs where sync_id != current_sync_id
--    Pro: Instant cleanup
--    Con: No grace period for API issues
--
-- 2. Grace Period GC (7-day recommended):
--    Close jobs where last_synced_at < NOW() - INTERVAL '7 days'
--    Pro: Safer, handles temporary API issues
--    Con: Delayed cleanup
--
-- Recommended: Use grace period GC for production safety
