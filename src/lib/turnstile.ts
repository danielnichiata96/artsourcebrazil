/**
 * Cloudflare Turnstile verification utilities.
 *
 * Turnstile is Cloudflare's CAPTCHA alternative that provides bot protection
 * without user friction. It's invisible by default and only shows a challenge
 * when suspicious activity is detected.
 *
 * @see https://developers.cloudflare.com/turnstile/
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifies a Turnstile token server-side.
 *
 * @param token - The cf-turnstile-response token from the client form
 * @param remoteIp - Optional client IP for additional validation
 * @returns Object with success status and optional error message
 *
 * @example
 * ```typescript
 * const { success, error } = await verifyTurnstile(token, clientIp);
 * if (!success) {
 *   return new Response(JSON.stringify({ error }), { status: 403 });
 * }
 * ```
 */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = import.meta.env.TURNSTILE_SECRET_KEY;

  // In development without key, skip validation
  if (!secretKey) {
    console.warn('[Turnstile] No secret key configured, skipping validation');
    return { success: true };
  }

  // Empty token means client didn't complete challenge
  if (!token) {
    return { success: false, error: 'Captcha token missing' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      const errorCodes = result['error-codes']?.join(', ') || 'unknown';
      console.error(`[Turnstile] Verification failed: ${errorCodes}`);
      return {
        success: false,
        error: `Captcha verification failed: ${errorCodes}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] API error:', error);
    // Fail open in case of API errors to not block legitimate users
    // Consider failing closed in high-security scenarios
    return { success: true };
  }
}

/**
 * Extracts Turnstile token from form data or JSON body.
 *
 * @param request - The incoming request
 * @returns The token string or null if not found
 */
export async function extractTurnstileToken(
  request: Request
): Promise<string | null> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const body = await request.clone().json();
      return body['cf-turnstile-response'] || body.turnstileToken || null;
    } catch {
      return null;
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.clone().formData();
      return (formData.get('cf-turnstile-response') as string) || null;
    } catch {
      return null;
    }
  }

  return null;
}

