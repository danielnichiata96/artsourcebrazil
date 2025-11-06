import type { APIRoute } from 'astro';
import jobs from '../data/jobs.json';

export const GET: APIRoute = async () => {
  const data = (jobs as any[]).sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  return new Response(JSON.stringify({ jobs: data }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
