import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://artsourcebrazil.vercel.app/', // Production URL - update with custom domain when available
  integrations: [tailwind(), sitemap()],
  output: 'static', // Explicitly set to static (default, but being explicit)
  security: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        // Removed 'unsafe-inline' - Astro bundles scripts as external files
        // If inline scripts are needed, they should use hashes or nonces
        'script-src': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com'],
        // Keep unsafe-inline for styles as Tailwind uses inline styles
        // Consider using style-src-attr if CSS-in-JS becomes an issue
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com'],
        'frame-ancestors': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'", 'https://buttondown.email'],
      },
    },
  },
});
