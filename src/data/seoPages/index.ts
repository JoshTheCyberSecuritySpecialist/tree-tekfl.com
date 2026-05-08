import { corePages } from './corePages';
import { locationDaytonaPages } from './locationDaytona';
import { locationPortOrangePages } from './locationPortOrange';
import { locationSouthDaytonaPages } from './locationSouthDaytona';
import { locationVolusiaPages } from './locationVolusia';
import { supportPages } from './supportPages';
import type { SeoPage } from './types';

export type { SeoFaq, SeoIntent, SeoPage, SeoSection } from './types';

/** All programmatic SEO landing pages — single source of truth for routes + sitemap. */
export const seoPages: SeoPage[] = [
  ...corePages,
  ...locationDaytonaPages,
  ...locationPortOrangePages,
  ...locationSouthDaytonaPages,
  ...locationVolusiaPages,
  ...supportPages,
];

const bySlug = Object.fromEntries(seoPages.map((p) => [p.slug, p])) as Record<string, SeoPage>;

export function getSeoPageBySlug(slug: string): SeoPage | undefined {
  return bySlug[slug];
}

export const SEO_PAGE_SLUGS = seoPages.map((p) => p.slug);

/** Core service slug for a given service label — powers internal related links. */
const SERVICE_TO_CORE: Partial<Record<string, string>> = {
  'Tree removal': 'tree-removal',
  'Tree trimming': 'tree-trimming',
  'Stump grinding': 'stump-grinding',
  'Emergency tree service': 'emergency-tree-service',
  'Storm cleanup': 'storm-cleanup',
  'Crane tree work': 'crane-tree-work',
  'Tree service': 'tree-service-volusia-county',
};

function scoreRelated(current: SeoPage, candidate: SeoPage): number {
  let score = 0;
  if (current.slug === candidate.slug) return -1;

  if (current.service && candidate.service && current.service === candidate.service) {
    score += 6;
  }
  if (current.location && candidate.location && current.location === candidate.location) {
    score += 5;
  }

  const core = current.service ? SERVICE_TO_CORE[current.service] : undefined;
  if (core && candidate.slug === core) score += 8;

  if (current.intent === 'informational') {
    if (candidate.intent === 'commercial') score += 2;
    if (candidate.slug === 'tree-removal' || candidate.slug === 'tree-trimming') score += 3;
  }

  if (current.intent === 'local-service' && candidate.intent === 'commercial' && current.service === candidate.service) {
    score += 4;
  }

  if (current.intent === 'commercial' && candidate.intent === 'local-service' && current.service === candidate.service) {
    score += 5;
  }

  return score;
}

/** Related pages for internal linking — service ↔ location ↔ informational. */
export function getRelatedSeoPages(page: SeoPage, limit = 8): SeoPage[] {
  const ranked = seoPages
    .filter((p) => p.slug !== page.slug)
    .map((p) => ({ p, s: scoreRelated(page, p) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);

  const seen = new Set<string>();
  const out: SeoPage[] = [];
  for (const { p } of ranked) {
    if (out.length >= limit) break;
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
  }

  // Fallback: ensure at least a few links for thin scores
  if (out.length < 4) {
    for (const p of seoPages) {
      if (p.slug === page.slug || seen.has(p.slug)) continue;
      out.push(p);
      seen.add(p.slug);
      if (out.length >= limit) break;
    }
  }

  return out.slice(0, limit);
}
