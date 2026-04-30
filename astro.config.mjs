import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url.endsWith('/privacy-policy/') || item.url.endsWith('/terms-of-use/')) {
          item.changefreq = 'yearly';
          item.priority = 0.3;
        } else {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://astrologyx.com',
  // Listen on all interfaces so phones/tablets on the same Wi‑Fi can open the site
  server: {
    host: true,
  },
});
