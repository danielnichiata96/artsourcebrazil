import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://artsourcebrazil.vercel.app', // TODO: update to your final domain
  integrations: [tailwind(), sitemap()],
});
