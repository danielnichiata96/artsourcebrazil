import type { APIRoute } from 'astro';
import { getJobs } from '../lib/getJobs';

export const GET: APIRoute = async () => {
  // Fetch fresh jobs from Supabase at request time (or build time for SSG)
  // Legacy endpoint - use /api/vagas.json for new implementations
  const jobs = await getJobs();
  const data = jobs.sort(
    (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
  );
  return new Response(JSON.stringify({ jobs: data }), {
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 1 minute
    },
  });
};
