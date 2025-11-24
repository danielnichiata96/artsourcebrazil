/**
 * Simple in-memory rate limiter for API endpoints
 * 
 * Prevents spam by limiting requests per IP address.
 * Good enough for MVP - migrate to Redis/Upstash if it scales.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart - acceptable for MVP)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Usually IP address or user ID
 * @param config - Rate limit configuration
 * @returns Object with { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  
  // Get or create entry
  let entry = store.get(identifier);
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(identifier, entry);
  }
  
  // Increment count
  entry.count++;
  
  // Check if over limit
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request
 * Handles proxies and common headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers (Vercel, Netlify, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if multiple (client IP is first)
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback (shouldn't happen in production)
  return 'unknown';
}

/**
 * Pre-configured rate limits for common use cases
 */
export const RATE_LIMITS = {
  /**
   * Job reporting: 3 reports per IP per hour
   * Prevents spam while allowing legitimate users to report multiple jobs
   */
  JOB_REPORT: {
    maxRequests: 3,
    windowSeconds: 60 * 60, // 1 hour
  },
  
  /**
   * Contact form: 2 submissions per IP per hour
   */
  CONTACT_FORM: {
    maxRequests: 2,
    windowSeconds: 60 * 60, // 1 hour
  },
  
  /**
   * Job posting: 5 submissions per IP per 10 minutes
   * Prevents accidental double-posts while allowing retries
   */
  JOB_POST: {
    maxRequests: 5,
    windowSeconds: 10 * 60, // 10 minutes
  },

  /**
   * Admin login: 5 attempts per IP per hour
   * Prevents brute-force on the single admin token
   */
  ADMIN_LOGIN: {
    maxRequests: 5,
    windowSeconds: 60 * 60, // 1 hour
  },
} as const;

