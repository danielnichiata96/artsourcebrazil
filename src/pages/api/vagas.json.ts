import type { APIRoute } from 'astro';
import { getJobs } from '../../lib/getJobs';
import type { Job } from '../../lib/jobs';

/**
 * API Endpoint: /api/vagas.json
 * 
 * Returns all active jobs from Supabase in JSON format.
 * Perfect for React/Vue/Vanilla JS components that need to consume job data.
 * 
 * This endpoint runs on the server (SSR) to fetch fresh data from Supabase
 * in real-time. Uses hybrid mode: pages are SSG, this API is SSR.
 * 
 * Usage in frontend:
 *   fetch('/api/vagas.json')
 *     .then(res => res.json())
 *     .then(data => console.log(data.jobs))
 * 
 * @returns JSON response with jobs array
 */

// Export this for use in frontend components (React/Vue/Vanilla JS)
export interface JobsApiResponse {
  jobs: Job[];
  count: number;
  lastUpdated: string;
}

// IMPORTANT: This must be false to run on the server (SSR), not at build time
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Fetch fresh jobs from Supabase
    const jobs = await getJobs();
    
    // Sort by date (newest first)
    const sortedJobs = jobs.sort(
      (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );

    // Build response with proper typing
    const response: JobsApiResponse = {
      jobs: sortedJobs,
      count: sortedJobs.length,
      lastUpdated: new Date().toISOString(),
    };

    // Return JSON response with CORS headers for external access
    // s-maxage: CDN cache (Vercel Edge Network)
    // stale-while-revalidate: Serve stale content while revalidating
    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30', // CDN cache for 1 min, serve stale for 30s while revalidating
          'Access-Control-Allow-Origin': '*', // Allow CORS for external components
          'Access-Control-Allow-Methods': 'GET',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching jobs from Supabase:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  }
};

