import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://astrologyx.com',
  // Listen on all interfaces so phones/tablets on the same Wi‑Fi can open the site
  server: {
    host: true,
  },
});
