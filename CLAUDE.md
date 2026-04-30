# AstrologyX Landing — Claude Guide

## Project overview

Static marketing/landing site for **AstrologyX** (iOS astrology app, App Store ID `1449148271`).  
Built with Astro 5 + Tailwind CSS 4, deployed to Cloudflare Pages.  
Site URL: `https://astrologyx.com`

## Package manager

Use **bun** exclusively. Never use `npm`, `yarn`, or `pnpm`.

```sh
bun install          # install dependencies
bun dev              # dev server (exposed on all interfaces for mobile testing)
bun run build        # production build → dist/
bun run preview      # serve the production build locally
bun run generate:qr  # regenerate App Store QR code (scripts/generate-app-store-qr.mjs)
```

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Astro 5 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Fonts | Inter (variable) + Playfair Display (400 / 400-italic) via `@fontsource` |
| Language | TypeScript (strict mode) |
| Deployment | Cloudflare Pages (auto-deploys on `main` push) |

## Project structure

```
src/
  config.ts              # App constants (APP_NAME, APP_STORE_URL, APP_VERSION)
  styles/global.css      # Tailwind v4 @theme tokens + global resets
  layouts/
    BaseLayout.astro     # Root HTML shell — SEO meta, OG tags, font imports
  components/
    Nav.astro
    Footer.astro
    sections/
      Hero.astro
      Benefits.astro
      AppShowcase.astro
      FeatureDive.astro
      FinalCTA.astro
  pages/
    index.astro
    privacy-policy.astro
    terms-of-use.astro
  assets/
    features/            # Feature illustration images
    screenshots/         # App screenshot images
public/
  _headers               # Cloudflare Pages cache + security response headers
  _redirects             # Cloudflare Pages redirect rules
  img/                   # Static images served at /img/*
scripts/
  generate-app-store-qr.mjs
```

## Path aliases

`@/*` resolves to `src/*` (configured in `tsconfig.json`).

```ts
import { APP_STORE_URL } from '@/config';
```

## Design system

All theme tokens are defined in `src/styles/global.css` under `@theme { … }`.  
Use these CSS custom properties (Tailwind utility classes are auto-generated from them):

- **Backgrounds**: `bg-page` (#131313), `bg-surface`, `bg-surface-low`, `bg-raised`, `bg-light` (white sections)
- **Text**: `text-primary` (#e2e2e2), `text-secondary`, `text-muted`, `text-dim`, `text-on-light`
- **Border**: `border-color` (rgba white 10%), `outline-variant`
- **Accent**: gold/amber palette — see `@theme` block for exact tokens
- Dark-first design; light sections are deliberate interrupts (showcase / CTA bands)

## Key constants (`src/config.ts`)

```ts
APP_NAME       = 'AstrologyX'
APP_STORE_URL  = 'https://apps.apple.com/app/id1449148271'
APP_STORE_ID   = '1449148271'
APP_VERSION    = '4.0.2'   // update this when releasing a new version
```

## Astro component conventions

- All components are `.astro` files; no React/Vue/Svelte.
- Props are typed with a `Props` interface in the component frontmatter.
- Use `BaseLayout.astro` for every page; pass `title`, `description`, `ogImage`, and `canonical` as needed.
- Section components live in `src/components/sections/`.

## Cloudflare Pages deployment

- `public/_headers` sets cache and security headers (CSP-free; handled at CF level).
- `public/_redirects` handles URL redirects.
- Hashed Astro assets (`/_astro/*`) are cached for 1 year (immutable).
- HTML pages use `Cache-Control: no-store, must-revalidate`.

## Do not

- Do not add a JS framework (React, Vue, etc.) unless explicitly requested.
- Do not change the package manager from bun.
- Do not commit build output (`dist/`).
- Do not hardcode the App Store URL or app name — always import from `src/config.ts`.
