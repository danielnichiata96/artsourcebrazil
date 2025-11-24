/**
 * Stripe Client Configuration
 * 
 * Server-side only Stripe client for creating Checkout Sessions
 * and handling payment operations.
 * 
 * SECURITY: Never expose the secret key to client-side code!
 */

import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
});

// Price ID for the job posting product ($99 USD for 30 days)
export const JOB_POSTING_PRICE_ID = import.meta.env.STRIPE_PRICE_ID;

if (!JOB_POSTING_PRICE_ID) {
    throw new Error('Missing STRIPE_PRICE_ID environment variable');
}
