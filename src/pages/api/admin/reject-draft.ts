/**
 * API Endpoint: Reject Draft
 * 
 * POST /api/admin/reject-draft
 * 
 * Rejects a draft and notifies the customer.
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { sendJobRejectedEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // Check authentication
        const authToken = cookies.get('admin_token')?.value;
        const validToken = import.meta.env.ADMIN_TOKEN || 'admin123';
        
        if (authToken !== validToken) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const body = await request.json();
        const { draft_id, reason } = body;

        if (!draft_id || !reason) {
            return new Response(
                JSON.stringify({ error: 'Missing draft_id or reason' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fetch the draft
        const { data: draft, error: fetchError } = await supabase
            .from('job_drafts')
            .select('*')
            .eq('id', draft_id)
            .eq('status', 'paid')
            .single();

        if (fetchError || !draft) {
            return new Response(
                JSON.stringify({ error: 'Draft not found or not paid' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Update draft status to rejected
        const { error: updateError } = await supabase
            .from('job_drafts')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                rejected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', draft_id);

        if (updateError) {
            console.error('Error updating draft:', updateError);
            return new Response(
                JSON.stringify({ error: 'Failed to update draft', details: updateError.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`❌ Draft ${draft_id} rejected. Reason: ${reason}`);

        // Send rejection email to customer
        try {
            await sendJobRejectedEmail(
                draft.email,
                draft.draft_data.title,
                reason
            );
        } catch (emailError) {
            console.error('Failed to send rejection email (non-critical):', emailError);
            // Don't fail the request if email fails
        }

        return new Response(
            JSON.stringify({ 
                success: true,
                message: 'Draft rejected successfully'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in reject-draft:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

