import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://artsourcebrazil.vercel.app/', // Production URL - update with custom domain when available
  integrations: [tailwind(), sitemap()],
});
