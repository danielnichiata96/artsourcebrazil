import type { APIRoute } from 'astro';
import jobs from '../data/jobs.json';
const site = 'https://artsourcebrazil.vercel.app';

export const GET: APIRoute = async () => {
  const items = (jobs as any[])
    .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    .map(
      (j) => `
      <item>
        <title><![CDATA[${j.jobTitle} — ${j.companyName}]]></title>
        <link>${j.applyLink}</link>
        <guid isPermaLink="false">${j.id}</guid>
        <pubDate>${new Date(j.postedDate).toUTCString()}</pubDate>
        <description><![CDATA[Category: ${j.category} | Tags: ${(j.tags || []).join(', ')}]]></description>
      </item>
    `,
    )
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>ArtSource Brazil — Jobs</title>
      <link>${site}</link>
      <description>Curated remote creative jobs for Brazil-based talent</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
