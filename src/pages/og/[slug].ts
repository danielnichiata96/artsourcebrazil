import { generateOgImageForJob } from '../../lib/og';
import type { APIRoute } from 'astro';
import jobs from '../../data/jobs.json';
import { slugify } from '../../lib/jobs';
import type { Job } from '../../lib/jobs';

// Generate a map for quick lookups
const jobsMap = new Map<string, Job>();
(jobs as Job[]).forEach((job) => {
  const key = `${job.id}-${slugify(job.jobTitle)}`;
  jobsMap.set(key, job);
});

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

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
export function getStaticPaths() {
  return (jobs as Job[]).map((job) => ({
    params: { slug: `${job.id}-${slugify(job.jobTitle)}.png` },
  }));
}
