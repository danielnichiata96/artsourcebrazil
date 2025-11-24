/**
 * API Endpoint: Update Draft (admin only)
 *
 * POST /api/admin/update-draft
 *
 * Allows admins to fix typos and adjust draft data before approval.
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { logAdminAction } from '../../../lib/admin-log';

export const prerender = false;

const DRAFT_FIELDS = [
  'title',
  'company_name',
  'category',
  'contract_type',
  'location_scope',
  'location_text',
  'salary_min',
  'salary_max',
  'salary_currency',
  'application_url',
  'company_logo_url',
  'description',
];

const NUMBER_FIELDS = ['salary_min', 'salary_max'];

function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function sanitizeString(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return String(value);
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const authToken = cookies.get('admin_token')?.value;
    const validToken = import.meta.env.ADMIN_TOKEN || 'admin123';

    if (authToken !== validToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { draft_id, updates } = body;

    if (!draft_id || !updates || typeof updates !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing draft_id or updates' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch draft (allow editing paid drafts only for now)
    const { data: draft, error: fetchError } = await supabase
      .from('job_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (fetchError || !draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sanitizedDraftFields: Record<string, unknown> = {};
    const sanitizedTopLevel: Record<string, unknown> = {};

    if ('email' in updates) {
      sanitizedTopLevel.email = sanitizeString(updates.email);
    }

    for (const field of DRAFT_FIELDS) {
      if (!(field in updates)) continue;

      if (NUMBER_FIELDS.includes(field)) {
        sanitizedDraftFields[field] = toNumberOrNull(updates[field]);
      } else {
        sanitizedDraftFields[field] = sanitizeString(updates[field]);
      }
    }

    const updatedDraftData = {
      ...(draft.draft_data || {}),
      ...sanitizedDraftFields,
    };

    const updatePayload: Record<string, unknown> = {
      draft_data: updatedDraftData,
      updated_at: new Date().toISOString(),
      last_admin_edit_at: new Date().toISOString(),
    };

    if ('email' in sanitizedTopLevel) {
      updatePayload.email = sanitizedTopLevel.email;
    }

    const { error: updateError } = await supabase
      .from('job_drafts')
      .update(updatePayload)
      .eq('id', draft_id);

    if (updateError) {
      console.error('Failed to update draft:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update draft' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await logAdminAction('update_draft', {
      draft_id,
      admin_identifier: `token:${validToken.slice(-4)}`,
      details: sanitizedDraftFields,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Draft updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating draft:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
