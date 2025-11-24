/**
 * API Endpoint: Stripe Webhook Handler
 * 
 * POST /api/stripe-webhook
 * 
 * Handles Stripe webhook events, specifically checkout.session.completed
 * to update job draft status after successful payment.
 */

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import { sendPaymentConfirmationEmail } from '../../lib/email';

// IMPORTANT: This must be false to run on the server (SSR), not at build time
export const prerender = false;

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
    try {
        // Get the raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return new Response(
                JSON.stringify({ error: 'Missing stripe-signature header' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!webhookSecret) {
            console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
            return new Response(
                JSON.stringify({ error: 'Webhook configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract metadata
            const draftId = session.metadata?.draft_id;

            if (!draftId) {
                console.error('Missing draft_id in session metadata');
                return new Response(
                    JSON.stringify({ error: 'Missing draft_id in metadata' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Update draft status in Supabase
            const { error: updateError } = await supabase
                .from('job_drafts')
                .update({
                    status: 'paid', // Changed from 'pending_approval' to 'paid' to match schema
                    stripe_session_id: session.id,
                    stripe_payment_intent: session.payment_intent as string, // Match column name in DB
                    paid_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', draftId);

            if (updateError) {
                console.error('Failed to update draft status:', updateError);
                return new Response(
                    JSON.stringify({ error: 'Failed to update draft' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }

            console.log(`✅ Payment successful for draft ${draftId}`);

            // Send confirmation email to customer
            try {
                const { data: draftData } = await supabase
                    .from('job_drafts')
                    .select('email, draft_data')
                    .eq('id', draftId)
                    .single();

                if (draftData) {
                    await sendPaymentConfirmationEmail(
                        draftData.email,
                        draftData.draft_data.title,
                        draftData.draft_data.company_name,
                        new Date()
                    );
                }
            } catch (emailError) {
                console.error('Failed to send confirmation email (non-critical):', emailError);
                // Don't fail the webhook if email fails
            }
        }

        // Return success response
        return new Response(
            JSON.stringify({ received: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Webhook handler error:', error);
        return new Response(
            JSON.stringify({ error: 'Webhook handler failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
