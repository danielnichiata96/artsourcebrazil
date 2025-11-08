import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '../lib/constants';

const site = SITE_CONFIG.SITE_URL;

interface BlogPost {
  slug: string;
  data: {
    title: string;
    description: string;
    publishDate: Date;
    isDraft?: boolean;
  };
}

export const GET: APIRoute = async () => {
  try {
    const allPosts = await getCollection('blog');
    
    const posts = (allPosts as BlogPost[])
      .filter((p) => !p.data.isDraft)
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

    const items = posts
      .map(
        (p) => `
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
      <title>${SITE_CONFIG.SITE_NAME} — Blog</title>
      <link>${site}/blog</link>
      <description>Guides and updates from ${SITE_CONFIG.SITE_NAME}</description>
      ${items}
    </channel>
  </rss>`;

    return new Response(rss, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error) {
    console.error('[blog.xml] Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
};
