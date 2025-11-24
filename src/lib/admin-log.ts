import { supabase } from './supabase';

interface LogPayload {
  draft_id?: string;
  job_id?: string;
  admin_identifier?: string;
  details?: Record<string, unknown>;
}

/**
 * Records an admin action in Supabase.
 * This never throws—errors are logged to the server console only.
 */
export async function logAdminAction(action: string, payload: LogPayload = {}) {
  try {
    await supabase.from('admin_activity_log').insert({
      action,
      draft_id: payload.draft_id || null,
      job_id: payload.job_id || null,
      admin_identifier: payload.admin_identifier || 'default_admin',
      details: payload.details || null,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
