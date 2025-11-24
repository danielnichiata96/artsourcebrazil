/**
 * API Endpoint: Admin Login
 * 
 * POST /api/admin/login
 * 
 * Authenticates admin user and sets session cookie.
 */

import type { APIRoute } from 'astro';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '../../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    try {
        const clientIp = getClientIp(request);
        const rateKey = `admin-login:${clientIp}`;
        const rateLimit = checkRateLimit(rateKey, RATE_LIMITS.ADMIN_LOGIN);

        if (!rateLimit.allowed) {
            console.warn('Admin login rate limited for IP:', clientIp);
            return redirect('/admin/drafts?error=rate-limit');
        }

        const formData = await request.formData();
        const password = formData.get('password') as string;
        
        const validToken = import.meta.env.ADMIN_TOKEN || 'admin123';
        
        if (password === validToken) {
            // Set authentication cookie
            cookies.set('admin_token', validToken, {
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'lax',
            });
            
            return redirect('/admin/drafts');
        } else {
            return redirect('/admin/drafts?error=invalid');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return redirect('/admin/drafts?error=failed');
    }
};

