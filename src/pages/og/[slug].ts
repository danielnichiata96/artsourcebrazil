import { generateOgImageForJob } from '../../lib/og';
import type { APIRoute } from 'astro';
import { getCachedJobs } from '../../lib/getJobs';
import { slugify } from '../../lib/jobs';
import type { Job } from '../../lib/jobs';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  // Fetch jobs from Supabase (cached per build)
  const jobs = await getCachedJobs();

  // Generate a map for quick lookups
  const jobsMap = new Map<string, Job>();
  jobs.forEach((job) => {
    const key = `${job.id}-${slugify(job.jobTitle)}`;
    jobsMap.set(key, job);
  });

  if (!slug || !jobsMap.has(slug)) {
    return new Response('Job not found', { status: 404 });
  }

  const job = jobsMap.get(slug)!;
  const pngBuffer = await generateOgImageForJob(job);

  return new Response(pngBuffer as unknown as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

// This is required to generate the routes for all jobs
export async function getStaticPaths() {
  const jobs = await getCachedJobs();
  return jobs.map((job) => ({
    params: { slug: `${job.id}-${slugify(job.jobTitle)}.png` },
  }));
}
