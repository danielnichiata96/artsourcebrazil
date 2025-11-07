// @ts-nocheck
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const site = 'https://artsourcebrazil.vercel.app';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog'))
    .filter((p: any) => !p.data.isDraft)
    .sort((a: any, b: any) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  const items = posts
    .map(
      (p: any) => `
      <item>
        <title><![CDATA[${p.data.title}]]></title>
        <link>${site}/blog/${p.slug}</link>
        <guid isPermaLink="true">${site}/blog/${p.slug}</guid>
        <pubDate>${p.data.publishDate.toUTCString()}</pubDate>
        <description><![CDATA[${p.data.description}]]></description>
      </item>
    `,
    )
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>ArtSource Brazil — Blog</title>
      <link>${site}/blog</link>
      <description>Guides and updates from ArtSource Brazil</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
