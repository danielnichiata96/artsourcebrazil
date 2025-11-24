/**
 * API Endpoint: Admin Logout
 * 
 * POST /api/admin/logout
 * 
 * Clears admin authentication cookie.
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
    cookies.delete('admin_token', { path: '/' });
    return redirect('/admin/drafts');
};

