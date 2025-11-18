import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://artsourcebrazil.vercel.app/', // Production URL - update with custom domain when available
  integrations: [tailwind(), sitemap()],
  output: 'hybrid', // Hybrid mode: SSG for pages, SSR for API routes
  adapter: vercel(), // Enable serverless functions for SSR routes
  security: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        // ✅ SECURE: No 'unsafe-inline' - Astro compiles <script> tags as external ES modules
        // All inline scripts are bundled and served from /_astro/*.js
        // JSON-LD schema scripts use type="application/ld+json" (not executable JS)
        'script-src': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com'],
        // Script elements (for external scripts loaded via src attribute)
        'script-src-elem': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com', 'https://fonts.googleapis.com'],
        // Style: Keep 'unsafe-inline' for Tailwind inline styles and Astro scoped styles
        // TODO: Consider migrating to style-src-attr + style-src-elem for stricter policy
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'connect-src': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com'],
        'frame-ancestors': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'", 'https://buttondown.email'],
      },
    },
  },
});
