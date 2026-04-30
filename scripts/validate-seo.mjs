#!/usr/bin/env node
/**
 * Post-build validation for SEO / GEO / AEO surfaces.
 *
 * Run after `bun run build`:
 *   bun run validate:seo
 *
 * Checks:
 *  - dist/index.html JSON-LD blocks (each @type's required fields)
 *  - dist/robots.txt has Sitemap directive
 *  - dist/sitemap-0.xml has at least 1 <url> with <lastmod>
 *  - dist/llms.txt exists and starts with H1
 *  - dist/llms-full.txt exists
 *
 * Exits non-zero on any error so it can fail CI.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const errors = [];
const warnings = [];
const ok = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function pass(msg) { ok.push(msg); }

// ── Extract JSON-LD blocks from rendered HTML ─────────────────────────────
function extractJsonLd(html) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1]));
    } catch (e) {
      err(`JSON-LD parse error: ${e.message}`);
    }
  }
  return out;
}

// ── Per-@type validators ──────────────────────────────────────────────────
const required = {
  WebSite: ['name', 'url'],
  Organization: ['name', 'url'],
  SoftwareApplication: ['name', 'operatingSystem', 'applicationCategory', 'offers'],
  MobileApplication: ['name', 'operatingSystem', 'applicationCategory', 'offers'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  WebPage: ['url', 'name'],
  HowTo: ['name', 'step'],
};

function typesOf(node) {
  const t = node['@type'];
  return Array.isArray(t) ? t : [t];
}

function validateBlock(block) {
  const types = typesOf(block);
  for (const t of types) {
    const fields = required[t];
    if (!fields) continue;
    for (const f of fields) {
      if (block[f] == null) err(`${t} is missing required field "${f}"`);
    }
  }
  if (types.includes('FAQPage')) {
    if (!Array.isArray(block.mainEntity) || block.mainEntity.length === 0) {
      err('FAQPage.mainEntity must be a non-empty array');
    } else {
      block.mainEntity.forEach((q, i) => {
        if (q['@type'] !== 'Question') err(`FAQPage.mainEntity[${i}] must be Question`);
        if (!q.name) err(`FAQPage.mainEntity[${i}] missing name`);
        if (!q.acceptedAnswer?.text) err(`FAQPage.mainEntity[${i}] missing acceptedAnswer.text`);
      });
    }
  }
  if (types.includes('BreadcrumbList')) {
    if (!Array.isArray(block.itemListElement) || block.itemListElement.length === 0) {
      err('BreadcrumbList.itemListElement must be a non-empty array');
    } else {
      block.itemListElement.forEach((item, i) => {
        if (item.position == null) err(`Breadcrumb[${i}] missing position`);
        if (!item.name) err(`Breadcrumb[${i}] missing name`);
        if (!item.item) err(`Breadcrumb[${i}] missing item`);
      });
    }
  }
  if (types.includes('HowTo')) {
    if (!Array.isArray(block.step) || block.step.length === 0) {
      err('HowTo.step must be a non-empty array');
    } else {
      block.step.forEach((s, i) => {
        if (s['@type'] !== 'HowToStep') err(`HowTo.step[${i}] must be HowToStep`);
        if (!s.text) err(`HowTo.step[${i}] missing text`);
      });
    }
  }
  if (types.includes('WebPage') && block.speakable) {
    const sp = block.speakable;
    if (!sp.cssSelector && !sp.xPath) {
      err('WebPage.speakable needs cssSelector or xPath');
    }
  }
  if (types.includes('SoftwareApplication') || types.includes('MobileApplication')) {
    if (!block.image && !block.screenshot) {
      warn('SoftwareApplication has no image or screenshot — Google rich results require one');
    }
    if (block.aggregateRating) {
      const r = block.aggregateRating;
      if (r.ratingValue == null) err('aggregateRating.ratingValue missing');
      if (r.ratingCount == null && r.reviewCount == null) {
        err('aggregateRating must have ratingCount or reviewCount');
      }
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────
const indexPath = resolve(dist, 'index.html');
if (!existsSync(indexPath)) {
  err(`Missing ${indexPath} — run \`bun run build\` first`);
} else {
  const html = readFileSync(indexPath, 'utf-8');
  const blocks = extractJsonLd(html);
  if (blocks.length === 0) err('No JSON-LD blocks found in dist/index.html');
  else pass(`Found ${blocks.length} JSON-LD blocks`);

  blocks.forEach(validateBlock);

  const seenTypes = new Set(blocks.flatMap(typesOf));
  for (const t of ['WebSite', 'Organization', 'SoftwareApplication', 'FAQPage', 'BreadcrumbList']) {
    if (seenTypes.has(t)) pass(`Schema present: ${t}`);
    else warn(`Schema missing: ${t}`);
  }

  // canonical, hreflang, OG image
  if (!/<link rel="canonical"/.test(html)) err('Missing canonical link');
  else pass('canonical link present');
  if (!/hreflang="en"/.test(html)) warn('hreflang="en" missing');
  if (!/property="og:image"/.test(html)) err('Missing og:image');
  else pass('og:image present');
  if (!/<a [^>]*class="skip-link"/.test(html)) warn('skip-link missing in body');
  else pass('skip-link present');
}

// robots.txt
const robotsPath = resolve(dist, 'robots.txt');
if (!existsSync(robotsPath)) err('dist/robots.txt missing');
else {
  const robots = readFileSync(robotsPath, 'utf-8');
  if (!/^Sitemap:\s*https?:\/\//m.test(robots)) err('robots.txt missing Sitemap directive');
  else pass('robots.txt has Sitemap directive');
}

// sitemap
const sitemapPath = resolve(dist, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) err('dist/sitemap-0.xml missing');
else {
  const sm = readFileSync(sitemapPath, 'utf-8');
  const urls = sm.match(/<url>/g)?.length ?? 0;
  const lastmods = sm.match(/<lastmod>/g)?.length ?? 0;
  if (urls === 0) err('sitemap has no <url> entries');
  else pass(`sitemap has ${urls} URLs (${lastmods} with lastmod)`);
  if (lastmods < urls) warn(`${urls - lastmods} sitemap URLs missing lastmod`);
}

// llms.txt + llms-full.txt
for (const f of ['llms.txt', 'llms-full.txt']) {
  const p = resolve(dist, f);
  if (!existsSync(p)) err(`dist/${f} missing`);
  else {
    const c = readFileSync(p, 'utf-8');
    if (!/^# /m.test(c)) warn(`${f} should start with an H1 (# Title)`);
    else pass(`${f} present (${c.length} bytes)`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────
console.log('\n── SEO validation ────────────────────────────');
ok.forEach((m) => console.log('  ✓ ' + m));
warnings.forEach((m) => console.log('  ⚠ ' + m));
errors.forEach((m) => console.log('  ✗ ' + m));
console.log('──────────────────────────────────────────────');
console.log(`${ok.length} passed · ${warnings.length} warnings · ${errors.length} errors`);

process.exit(errors.length > 0 ? 1 : 0);
