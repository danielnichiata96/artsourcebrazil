/**
 * API Endpoint: Create Stripe Checkout Session
 * 
 * POST /api/create-checkout-session
 * 
 * Creates a Stripe Checkout Session for job posting payment.
 * Requires a valid draft_id from the job_drafts table.
 */

import type { APIRoute } from 'astro';
import { stripe, JOB_POSTING_PRICE_ID } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

// IMPORTANT: This must be false to run on the server (SSR), not at build time
export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
    try {
        // Check if request has body
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return new Response(
                JSON.stringify({ error: 'Content-Type must be application/json' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get request body with error handling
        let body;
        try {
            const text = await request.text();
            if (!text || text.trim() === '') {
                return new Response(
                    JSON.stringify({ error: 'Request body is empty' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            body = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return new Response(
                JSON.stringify({ error: 'Invalid JSON in request body' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { draft_id, draft_data } = body;

        let draft;

        // If draft_id is provided, fetch from database
        if (draft_id) {
            const { data: fetchedDraft, error: draftError } = await supabase
                .from('job_drafts')
                .select('id, email, company_name, draft_data, status')
                .eq('id', draft_id)
                .single();

            if (draftError || !fetchedDraft) {
                return new Response(
                    JSON.stringify({ error: 'Draft not found' }),
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }

            draft = fetchedDraft;
        } 
        // If draft_data is provided, create or update draft in database first
        else if (draft_data) {
            const { email, company_name, draft_data: jobData } = draft_data;

            if (!email || !company_name) {
                return new Response(
                    JSON.stringify({ error: 'Missing email or company_name in draft_data' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Check if draft already exists for this email/company
            const { data: existingDraft, error: checkError } = await supabase
                .from('job_drafts')
                .select('id, email, company_name, draft_data, status')
                .eq('email', email)
                .eq('company_name', company_name)
                .eq('status', 'draft')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            let newDraft;
            
            if (existingDraft && !checkError) {
                // Update existing draft
                const { data: updatedDraft, error: updateError } = await supabase
                    .from('job_drafts')
                    .update({
                        draft_data: jobData,
                        status: 'draft',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingDraft.id)
                    .select()
                    .single();

                if (updateError || !updatedDraft) {
                    console.error('Failed to update draft:', updateError);
                    return new Response(
                        JSON.stringify({ error: 'Failed to update draft' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }

                newDraft = updatedDraft;
            } else {
                // Create new draft
                const { data: createdDraft, error: createError } = await supabase
                    .from('job_drafts')
                    .insert({
                        email,
                        company_name,
                        draft_data: jobData,
                        status: 'draft',
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (createError || !createdDraft) {
                    console.error('Failed to create draft:', createError);
                    return new Response(
                        JSON.stringify({ error: 'Failed to create draft' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }

                newDraft = createdDraft;
            }

            draft = newDraft;
        } 
        // Neither draft_id nor draft_data provided
        else {
            return new Response(
                JSON.stringify({ error: 'Missing draft_id or draft_data' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Don't allow payment for already paid drafts
        if (draft.status === 'pending_approval' || draft.status === 'approved' || draft.status === 'published') {
            return new Response(
                JSON.stringify({ error: 'This draft has already been paid for' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get the base URL for redirects
        const baseUrl = url.origin;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price: JOB_POSTING_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/post-a-job/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/post-a-job/preview`,
            customer_email: draft.email,
            metadata: {
                draft_id: draft.id,
                email: draft.email,
                company_name: draft.company_name,
            },
        });

        return new Response(
            JSON.stringify({ url: session.url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to create checkout session' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
