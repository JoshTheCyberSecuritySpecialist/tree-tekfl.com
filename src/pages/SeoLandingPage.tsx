import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileCheck2,
  HeartHandshake,
  Home,
  Landmark,
  LifeBuoy,
  MapPin,
  TreePine,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Truck,
  TrafficCone,
  Trees,
  UserCheck,
  Waves,
  Wrench,
  Wind,
} from 'lucide-react';
import BlogMarkdown from '../components/BlogMarkdown';
import JsonLd from '../components/JsonLd';
import SEO from '../components/SEO';
import Section from '../components/Section';
import { getRelatedSeoPages, getSeoPageBySlug } from '../data/seoPages';
import type { SeoPage } from '../data/seoPages';
import { absoluteUrl, getSiteUrl } from '../lib/siteUrl';
import { getServicePageSchema } from '../schema/localBusiness';
import { sitePagesApi } from '../services/api';
import { phoneToTel, usePublicWorkspaceSettings } from '../lib/workspaceSettings';
import NotFound from './NotFound';

type Props = { slug: string };

type RelatedLinkItem = {
  slug: string;
  h1: string;
  metaDescription: string;
};

const DEFAULT_HERO_IMAGE =
  '/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png';
const PERMIT_PAGE_SLUG = 'do-you-need-a-permit-to-remove-a-tree-in-florida';
const PORT_ORANGE_TREE_REMOVAL_SLUG = 'tree-removal-port-orange';
const EMERGENCY_TREE_SERVICE_SLUG = 'emergency-tree-service';
const WHEN_TO_REMOVE_TREE_SLUG = 'when-to-remove-a-tree';
const TREE_MAINTENANCE_GUIDE_SLUG = 'tree-maintenance-guide';
const STORM_CLEANUP_SLUG = 'storm-cleanup';
const CRANE_TREE_WORK_SLUG = 'crane-tree-work';
const EMERGENCY_TREE_SERVICE_DAYTONA_SLUG = 'emergency-tree-service-daytona-beach';
const STUMP_GRINDING_VOLUSIA_SLUG = 'stump-grinding-volusia-county';
const TREE_TRIMMING_SLUG = 'tree-trimming';
const STUMP_GRINDING_SLUG = 'stump-grinding';

function resolvePublicHeroImage(path?: string | null): string | undefined {
  if (!path) return undefined;
  // Legacy placeholders from prior content imports no longer exist in /public.
  if (path.startsWith('/images/past-work/')) return DEFAULT_HERO_IMAGE;
  return path;
}

/**
 * Keep service/local guide clicks aligned to designated canonical routes.
 * This avoids legacy location slugs being surfaced in related-link cards.
 */
const RELATED_ROUTE_OVERRIDES: Record<string, string> = {
  'tree-removal-port-orange': 'stump-grinding-port-orange',
  'tree-trimming-port-orange': 'stump-grinding-port-orange',
  'stump-grinding-daytona-beach': 'tree-removal-daytona-beach',
  'tree-trimming-daytona-beach': 'tree-removal-daytona-beach',
  'tree-removal-volusia-county': 'emergency-tree-service-volusia-county',
  'stump-grinding-volusia-county': 'emergency-tree-service-volusia-county',
};

function getDesignatedRelatedLinks(related: SeoPage[]): RelatedLinkItem[] {
  const seen = new Set<string>();
  const out: RelatedLinkItem[] = [];

  for (const item of related) {
    const slug = RELATED_ROUTE_OVERRIDES[item.slug] ?? item.slug;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const canonical = getSeoPageBySlug(slug);
    out.push({
      slug,
      h1: canonical?.h1 ?? item.h1,
      metaDescription: canonical?.metaDescription ?? item.metaDescription,
    });
  }

  return out;
}

function getHeroImageObjectPositionClasses(page: SeoPage): string {
  if (page.slug === PERMIT_PAGE_SLUG) {
    // Keep permit sign and clipboard anchored in frame across breakpoints.
    return 'object-left';
  }
  // Keep worker/cutting action visible on smaller screens for this specific page.
  if (page.slug === 'tree-trimming-daytona-beach') {
    // Shift focal point down so waterfront remains visible while preserving worker focus.
    return 'object-[center_65%] md:object-[center_58%] lg:object-center';
  }
  if (page.slug === 'tree-removal-port-orange') {
    // Keep crane arm, lifted section, and waterfront context visible on smaller screens.
    return 'object-top lg:object-center';
  }
  if (page.slug === 'tree-trimming-port-orange') {
    // Keep climber + crane truck + waterfront context visible on smaller screens.
    return 'object-top lg:object-center';
  }
  if (page.slug === 'stump-grinding-south-daytona') {
    // Slight right shift on mobile keeps grinder/action in frame; centered on larger screens.
    return 'object-[65%_center] md:object-center';
  }
  return 'object-center';
}

function getHeroFrameClasses(slug: string): string {
  if (slug === PERMIT_PAGE_SLUG) {
    return 'w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100';
  }
  if (slug === 'tree-removal') {
    return 'w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 bg-white';
  }
  if (slug === 'stump-grinding-port-orange') {
    return 'w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 bg-white';
  }
  if (slug === 'crane-tree-work') {
    return 'w-full rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10 p-2';
  }
  return 'w-full h-[250px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100';
}

/** Published CMS row from `public.site_pages` (subset used on public site). */
export type CmsSitePageRow = {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  excerpt: string | null;
  content: string | null;
  page_type: string;
  location: string | null;
  service_type: string | null;
  featured_image_url: string | null;
};

function buildWebPageLd(page: SeoPage, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.metaTitle,
    headline: page.h1,
    description: page.metaDescription,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: 'TREE TEK',
      url: getSiteUrl(),
    },
  };
}

function buildFaqLd(page: SeoPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

function buildWebPageLdFromCms(row: CmsSitePageRow, path: string) {
  const metaTitle = row.meta_title || row.title;
  const headline = row.h1 || row.title;
  const description = row.meta_description || row.excerpt || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metaTitle,
    headline,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: 'TREE TEK',
      url: getSiteUrl(),
    },
  };
}

function cmsRowToSeoPageForRelated(row: CmsSitePageRow): SeoPage {
  const base = getSeoPageBySlug(row.slug);
  if (base) return base;
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title || row.title,
    metaDescription: row.meta_description || row.excerpt || '',
    primaryKeyword: row.service_type || row.title,
    secondaryKeywords: [],
    intent: row.location ? 'local-service' : 'informational',
    service: row.service_type || null,
    location: row.location || null,
    h1: row.h1 || row.title,
    intro: row.excerpt || '',
    sections: [],
    faqs: [],
    ctaText: 'Get a Free Quote',
    heroImage: row.featured_image_url || undefined,
  };
}

function CmsSiteArticle({
  row,
  ctaText,
  phone,
  telHref,
}: {
  row: CmsSitePageRow;
  ctaText: string;
  phone: string;
  telHref: string;
}) {
  const path = `/${row.slug}`;
  const metaTitle = row.meta_title || row.title;
  const metaDescription = row.meta_description || row.excerpt || '';
  const h1 = row.h1 || row.title;
  const intro = row.excerpt || '';
  const keywords = [row.service_type, row.location, row.title].filter(Boolean).join(', ');
  const related = getRelatedSeoPages(cmsRowToSeoPageForRelated(row), 8);
  const designatedRelated = getDesignatedRelatedLinks(related).slice(0, 8);
  const webLd = buildWebPageLdFromCms(row, path);
  const areaServed = row.location != null ? `${row.location}, FL` : 'Volusia County, FL';
  const serviceLd = row.service_type
    ? getServicePageSchema({
        name: row.service_type,
        description: metaDescription || intro,
        path,
        areaServed,
      })
    : null;

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={keywords}
        path={path}
        image={resolvePublicHeroImage(row.featured_image_url)}
      />
      <JsonLd data={webLd} />
      {serviceLd ? <JsonLd data={serviceLd} /> : null}

      <article className="bg-emerald-50/40">
        <header className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-14">
            <p className="text-emerald-200 text-sm font-medium uppercase tracking-wide mb-2">
              {row.location ? `${row.location} • TREE TEK` : 'TREE TEK • Volusia County'}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">{h1}</h1>
            {intro ? <p className="text-lg text-emerald-100 max-w-3xl leading-relaxed">{intro}</p> : null}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/quote"
                className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-8 rounded-lg hover:bg-emerald-50 transition shadow-lg"
              >
                {ctaText}
              </Link>
              <a
                href={telHref}
                className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg border border-emerald-500/40 transition"
              >
                Call {phone}
              </a>
            </div>
          </div>
        </header>

        {row.featured_image_url ? (
          <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
            <div
              className={`w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-100 ${
                row.slug === PERMIT_PAGE_SLUG ? 'aspect-[16/9]' : 'h-[250px] md:h-[400px]'
              }`}
            >
              <img
                src={resolvePublicHeroImage(row.featured_image_url) || DEFAULT_HERO_IMAGE}
                alt={
                  row.slug === PERMIT_PAGE_SLUG
                    ? 'Tree Tek crew reviewing tree removal permit requirements in Florida with clipboard and permit sign near residential property'
                    : h1
                }
                className={`w-full h-full object-cover ${
                  row.slug === PERMIT_PAGE_SLUG ? 'object-left saturate-90' : 'object-center'
                }`}
                loading={row.slug === PERMIT_PAGE_SLUG ? 'eager' : 'lazy'}
                fetchPriority={row.slug === PERMIT_PAGE_SLUG ? 'high' : 'auto'}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_HERO_IMAGE;
                }}
              />
              {row.slug === PERMIT_PAGE_SLUG ? (
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/25 to-transparent"
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {row.content?.trim() ? (
          <Section variant="white">
            <div className="max-w-3xl mx-auto prose prose-emerald">
              <BlogMarkdown variant="article">{row.content}</BlogMarkdown>
            </div>
          </Section>
        ) : null}

        <Section variant="white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related services & guides</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-gray-700">
              {designatedRelated.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/${r.slug}`}
                    className="block rounded-lg border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-3 transition"
                  >
                    <span className="font-semibold text-emerald-800">{r.h1}</span>
                    <span className="block text-sm text-gray-500 mt-0.5 line-clamp-2">{r.metaDescription.slice(0, 110)}…</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <section className="border-t border-gray-200 bg-gray-100">
          <div className="max-w-4xl mx-auto px-5 py-10 md:px-8 md:py-16">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-10 shadow-xl shadow-emerald-950/25 ring-1 ring-emerald-800/60">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center leading-snug">
                Ready for safe, professional tree service?
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-emerald-50/95 text-center max-w-2xl mx-auto leading-relaxed">
                Request a free quote or call TREE TEK for fast service across Volusia County.
              </p>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                <Link
                  to="/quote"
                  className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                >
                  {ctaText}
                </Link>
                <a
                  href={telHref}
                  className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0 opacity-95" aria-hidden />
                  Call {phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

function StaticSeoArticle({
  page,
  ctaText,
  phone,
  telHref,
}: {
  page: SeoPage;
  ctaText: string;
  phone: string;
  telHref: string;
}) {
  const path = `/${page.slug}`;
  const isEmergencyTreeService = page.slug === EMERGENCY_TREE_SERVICE_SLUG;
  const isPortOrangeTreeRemoval = page.slug === PORT_ORANGE_TREE_REMOVAL_SLUG;
  const isWhenToRemoveTree = page.slug === WHEN_TO_REMOVE_TREE_SLUG;
  const isTreeMaintenanceGuide = page.slug === TREE_MAINTENANCE_GUIDE_SLUG;
  const isStormCleanup = page.slug === STORM_CLEANUP_SLUG;
  const isCraneTreeWork = page.slug === CRANE_TREE_WORK_SLUG;
  const isEmergencyTreeServiceDaytona = page.slug === EMERGENCY_TREE_SERVICE_DAYTONA_SLUG;
  const isStumpGrindingVolusia = page.slug === STUMP_GRINDING_VOLUSIA_SLUG;
  const isTreeTrimming = page.slug === TREE_TRIMMING_SLUG;
  const isStumpGrinding = page.slug === STUMP_GRINDING_SLUG;
  const keywords = [page.primaryKeyword, ...page.secondaryKeywords].join(', ');
  const related = getRelatedSeoPages(page, 8);
  const designatedRelated = getDesignatedRelatedLinks(related).slice(0, 8);

  const webLd = buildWebPageLd(page, path);
  const faqLd = page.faqs.length > 0 ? buildFaqLd(page) : null;

  const areaServed =
    page.location != null ? `${page.location}, FL` : 'Volusia County, FL';

  const serviceLd =
    page.service && page.intent !== 'informational'
      ? getServicePageSchema({
          name: page.service,
          description: page.metaDescription,
          path,
          areaServed,
        })
      : null;

  if (isStormCleanup) {
    const stormFaqs = [
      {
        q: 'What should I do first after storm damage?',
        a: 'Prioritize safety, stay clear of unstable trees and hanging limbs, and call for professional hazard assessment before cleanup begins.',
      },
      {
        q: 'Can TREE TEK remove fallen limbs from my property?',
        a: 'Yes. We provide fallen limb removal, hazardous branch clearing, and controlled debris handling.',
      },
      {
        q: 'Do you clean up storm debris?',
        a: 'Yes. Our storm cleanup services include cutting, staging, and hauling debris based on site needs.',
      },
      {
        q: 'Is a leaning tree dangerous after a storm?',
        a: 'It can be. Leaning after wind or rain may indicate structural or root instability and should be evaluated promptly.',
      },
      {
        q: 'Can saturated soil make trees unstable?',
        a: 'Yes. Saturated soil can reduce root anchorage and increase failure risk after severe weather.',
      },
      {
        q: 'Do you help waterfront properties after storms?',
        a: 'Yes. TREE TEK services waterfront homes with careful planning around seawalls, docks, pavers, and landscape features.',
      },
      {
        q: 'Can you remove trees with cranes or rigging?',
        a: 'Yes. We use crane-assisted or rigging-based methods when conditions require controlled removal near structures.',
      },
      {
        q: 'Do you provide emergency storm cleanup?',
        a: 'Yes. We provide emergency tree cleanup and storm damaged tree removal across Port Orange and Volusia County.',
      },
    ];
    const stormFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: stormFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const processCards = [
      'Assess hazards',
      'Secure the work area',
      'Prioritize access routes',
      'Remove hanging limbs',
      'Cut and stage debris',
      'Protect turf and landscaping',
      'Haul away debris',
      'Final cleanup',
    ];
    const checklistCards = [
      'Tree or limb on roof',
      'Blocked driveway or roadway',
      'Hanging limbs over walkways',
      'Tree leaning after heavy wind',
      'Cracked trunk or split crown',
      'Limbs near power/service lines',
      'Uprooted or partially uprooted tree',
      'Debris blocking waterfront access',
    ];
    const trustCards = [
      'Fast Storm Response',
      'Controlled Removal Methods',
      'Waterfront Property Experience',
      'Professional Equipment',
      'Careful Property Protection',
      'Local Volusia County Knowledge',
      'Clean Worksites',
      'Licensed & Insured',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={stormFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • PORT ORANGE • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Storm Cleanup &amp; Wind Damage Removal in Port Orange, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Severe weather can leave fallen limbs, broken crowns, uprooted trees, and blocked driveways across
                    coastal Florida properties. TREE TEK provides professional storm cleanup and wind damage removal
                    with controlled cutting, careful debris handling, and property protection for homes throughout Port
                    Orange and Volusia County.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-emerald-200/30 shadow-2xl bg-emerald-900/20">
                  <img
                    src="/images/Storm-Cleanup-And-Wind-Damage-Removal-Port-Orange-FL.png"
                    alt="TREE TEK storm cleanup and wind damage removal in Port Orange Florida"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What Storm Cleanup Includes</h2>
              <p className="text-gray-700 leading-relaxed">
                Storm cleanup Port Orange FL homeowners request often includes fallen limb removal, broken branch
                cleanup, hazardous tree evaluation, driveway and access clearing, debris hauling, controlled cutting,
                roofline protection, and cleanup around seawalls, docks, pools, and surrounding landscaping.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Wind-Damaged Trees Are Dangerous</h2>
              <p className="text-gray-700 leading-relaxed">
                Wind can split limbs, weaken branch attachments, expose decay, shift root plates, and leave hanging
                branches that may fail later. Saturated soils after storms can reduce root stability, increasing risk of
                delayed failure and emergency tree cleanup needs.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">TREE TEK’s Storm Cleanup Process</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {processCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Storm Cleanup for Waterfront &amp; High-End Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront storm cleanup requires planning around docks, seawalls, pools, pavers, irrigation systems,
                and luxury landscaping. TREE TEK evaluates tight access conditions, crane or rigging needs, and careful
                equipment placement to protect high-value property features while completing storm damaged tree removal.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">When to Call After a Storm</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {checklistCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Port Orange Homeowners Choose TREE TEK</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Storm Damage &amp; Tree Safety Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'International Society of Arboriculture',
                    href: 'https://www.isa-arbor.com/',
                  },
                  {
                    title: 'UF/IFAS Tree Care Resources',
                    href: 'https://hort.ifas.ufl.edu/woody/',
                  },
                  {
                    title: 'Florida Forest Service Urban & Community Forestry',
                    href: 'https://www.fdacs.gov/Forest-Wildfire/Our-Forests/Urban-and-Community-Forestry',
                  },
                  {
                    title: 'National Hurricane Center Preparedness',
                    href: 'https://www.nhc.noaa.gov/prepare/ready.php',
                  },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {stormFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isCraneTreeWork) {
    const craneFaqs = [
      {
        q: 'When is crane-assisted tree removal necessary?',
        a: 'Crane-assisted tree removal is often the safer option when there is limited lay-down space or large sections extend over structures and high-value property features.',
      },
      {
        q: 'Is crane tree removal safer near homes?',
        a: 'Yes. In many cases, crane tree work improves control by lifting sections vertically instead of dropping or swinging them near rooflines, fences, or hardscape.',
      },
      {
        q: 'Can cranes be used on waterfront properties?',
        a: 'Yes. Waterfront tree removal can be planned around seawalls, docks, and narrow access with controlled lifting and staging.',
      },
      {
        q: 'Will crane work damage my driveway or lawn?',
        a: 'Our team plans access routes, setup zones, and protection measures to reduce surface impact during crane-assisted tree removal.',
      },
      {
        q: 'Can TREE TEK remove storm-damaged trees with a crane?',
        a: 'Yes. Crane support can be used for storm damaged tree removal when compromised trees need controlled section lifting.',
      },
      {
        q: 'How do crews control large tree sections?',
        a: 'Crews coordinate pick points, rigging setup, operator communication, and controlled cutting so each section is lifted and staged safely.',
      },
      {
        q: 'Do you service tight-access properties in Port Orange?',
        a: 'Yes. We provide tight access tree removal planning for Port Orange properties with limited staging and constrained side-yard access.',
      },
      {
        q: 'Do you provide crane tree work in Volusia County?',
        a: 'Yes. TREE TEK provides crane tree work and related Volusia County tree service support throughout the surrounding area.',
      },
    ];
    const craneFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: craneFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const processSteps = [
      'Site assessment',
      'Crane access planning',
      'Pick point selection',
      'Rigging setup',
      'Controlled cutting',
      'Vertical lifting',
      'Debris staging',
      'Final cleanup',
    ];
    const protectionCards = [
      'Rooflines',
      'Driveways',
      'Pavers',
      'Turf',
      'Irrigation',
      'Pools',
      'Docks',
      'Seawalls',
      'Landscaping',
      'Neighboring structures',
    ];
    const trustCards = [
      'Crane-Assisted Removal Experience',
      'Professional Rigging Methods',
      'Waterfront Property Experience',
      'Careful Property Protection',
      'Local Volusia County Knowledge',
      'Clean Worksites',
      'Responsive Communication',
      'Licensed & Insured',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={craneFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • PORT ORANGE • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Crane-Assisted Tree Removal in Port Orange, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    When a tree cannot be safely lowered into open space, crane-assisted tree removal allows large
                    sections to be lifted with control and precision. TREE TEK uses crane planning, rigging
                    coordination, and careful property protection for waterfront homes, tight-access lots, pools,
                    rooflines, and high-value residential properties throughout Port Orange and Volusia County.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10 p-2">
                  <img
                    src={resolvePublicHeroImage(page.heroImage) || DEFAULT_HERO_IMAGE}
                    alt={page.heroImageAlt ?? 'TREE TEK crane-assisted tree work in Port Orange Florida'}
                    className="w-full h-auto object-contain rounded-xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">When Crane Tree Work Is the Safer Option</h2>
              <p className="text-gray-700 leading-relaxed">
                Crane tree removal Port Orange FL projects are often selected when lay-down space is limited, large
                limbs hang over structures, or trees are near homes, pools, fences, docks, seawalls, and tight side
                yards. Crane-assisted tree removal can also support storm damaged tree removal and high-risk picks near
                commercial rooftops while reducing uncontrolled drops.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How Crane-Assisted Tree Removal Works</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {processSteps.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Planning Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                Crane tree work requires load balance calculations, proper pick point selection, clear communication
                between the crew and operator, and surface protection planning. Every cut is controlled to reduce shock
                to rigging, pavers, rooflines, and nearby structures during tree removal near homes.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Crane Tree Work for Waterfront &amp; High-End Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront tree removal planning may involve seawalls, docks, pools, pavers, irrigation systems, luxury
                landscaping, and limited equipment staging. TREE TEK coordinates tight access tree removal with
                controlled debris handling to support high-end Port Orange properties.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What TREE TEK Protects During Crane Work</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {protectionCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Port Orange Homeowners Choose TREE TEK</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Crane Tree Work &amp; Tree Safety Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'International Society of Arboriculture',
                    href: 'https://www.isa-arbor.com/',
                  },
                  {
                    title: 'Tree Care Industry Association',
                    href: 'https://treecareindustryassociation.org/',
                  },
                  {
                    title: 'ANSI A300 Tree Care Standards',
                    href: 'https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx',
                  },
                  {
                    title: 'OSHA Crane Safety',
                    href: 'https://www.osha.gov/cranes-derricks',
                  },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {craneFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isTreeTrimming) {
    const trimmingFaqs = [
      {
        q: 'How often should trees be trimmed in Port Orange?',
        a: 'Frequency depends on species, growth rate, storm exposure, and proximity to structures. Many residential properties benefit from periodic professional evaluation.',
      },
      {
        q: 'Is tree topping harmful?',
        a: 'Yes. Topping can weaken structure, increase decay risk, and cause unstable regrowth. TREE TEK uses targeted pruning methods instead.',
      },
      {
        q: 'What is the best time to prune trees in Florida?',
        a: 'Timing depends on species and site conditions, but safety and structural risk issues should be addressed as soon as practical.',
      },
      {
        q: 'Can pruning reduce storm damage?',
        a: 'Strategic pruning can reduce weak attachments, deadwood, and canopy loading, which may lower storm-related limb failure risk.',
      },
      {
        q: 'Do you trim trees near waterfront homes?',
        a: 'Yes. We provide waterfront tree pruning with careful planning around docks, seawalls, rooflines, and landscape features.',
      },
      {
        q: 'What is the difference between trimming and pruning?',
        a: 'Pruning is a selective, biology-informed approach to structure and health; trimming is often used more generally for canopy management and clearance.',
      },
      {
        q: 'Can trimming improve tree health?',
        a: 'Yes, when performed correctly. Removing deadwood and improving structure can support healthier long-term growth.',
      },
      {
        q: 'Do you service luxury waterfront properties?',
        a: 'Yes. TREE TEK regularly services high-value waterfront and coastal properties throughout Port Orange and Volusia County.',
      },
    ];
    const trimmingFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: trimmingFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const pruneForCards = [
      'Fewer Hangers Over Roofs',
      'Better Airflow Through Crowns',
      'Removal of Deadwood',
      'Improved Safety',
      'Structural Integrity',
      'Clearance From Homes',
      'Healthier Growth',
      'Storm Readiness',
    ];
    const trustCards = [
      'Waterfront Property Experience',
      'Professional Equipment',
      'ISA-Informed Methods',
      'Careful Property Protection',
      'Local Volusia County Knowledge',
      'Clean Worksites',
      'Responsive Communication',
      'Licensed & Insured',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={trimmingFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • PORT ORANGE • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Professional Tree Trimming &amp; Pruning in Port Orange, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Professional tree trimming improves safety, structure, airflow, and long-term tree health. TREE TEK
                    uses targeted pruning methods designed for Florida&apos;s coastal wind exposure, mature neighborhoods,
                    waterfront homes, and high-value residential properties.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-emerald-200/30 shadow-2xl bg-emerald-900/20">
                  <img
                    src="/images/Tree-Trimming-And-Pruning-Port-Orange-TREE-TEK.png"
                    alt="TREE TEK professional tree trimming and pruning in Port Orange Florida"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/images/Tree-Trimming-And-Pruning-Port-Orange-FL.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Professional Tree Pruning Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                Professional tree trimming Port Orange FL homeowners invest in helps reduce hazardous deadwood, improve
                branch structure, clear roofs and walkways, improve canopy airflow, support long-term tree health, and
                reduce storm-related limb failure risk.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">The Science Behind Proper Pruning</h2>
              <p className="text-gray-700 leading-relaxed">
                Proper pruning respects branch collars, canopy balance, species biology, structural growth, and wound
                response. ISA and ANSI A300 pruning standards support selective pruning, crown cleaning, crown
                reduction, and clearance pruning when performed correctly.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Topping Is Not Proper Pruning</h2>
              <p className="text-gray-700 leading-relaxed">
                Topping can weaken trees, create unstable regrowth, increase decay risk, stress the canopy, and shorten
                lifespan. TREE TEK uses targeted reductions and thinning instead of topping, aligned with professional
                tree pruning Port Orange best practices.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Coastal Florida Tree Pruning Considerations</h2>
                <p className="text-gray-700 leading-relaxed">
                  Coastal wind exposure, salt stress, dense canopy loading, and hurricane preparation all influence how
                  trees should be pruned in Port Orange and Volusia County. Waterfront tree pruning near docks, pools,
                  rooflines, and high-value landscaping requires careful planning and controlled execution.
                </p>
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What TREE TEK Prunes For</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pruneForCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Tree Trimming for Waterfront &amp; High-End Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront and luxury properties require additional care around irrigation systems, pavers, rooflines,
                docks, seawalls, and decorative landscapes. TREE TEK uses careful equipment placement and controlled
                cleanup methods to preserve high-end property finishes during professional tree trimming.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Port Orange Homeowners Choose TREE TEK</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Educational Tree Pruning Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'International Society of Arboriculture',
                    href: 'https://www.isa-arbor.com/',
                    desc: 'Industry-leading arboriculture education and professional tree care resources.',
                  },
                  {
                    title: 'UF/IFAS Tree Care Resources',
                    href: 'https://hort.ifas.ufl.edu/woody/',
                    desc: 'University-backed tree biology and care resources for Florida conditions.',
                  },
                  {
                    title: 'ANSI A300 Tree Care Standards',
                    href: 'https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx',
                    desc: 'Recognized standards for professional pruning and tree care practices.',
                  },
                  {
                    title: 'Florida-Friendly Landscaping',
                    href: 'https://ffl.ifas.ufl.edu/',
                    desc: 'Research-backed landscaping practices for sustainable Florida properties.',
                  },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {trimmingFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isStumpGrindingVolusia) {
    const volusiaStumpFaqs = [
      {
        q: 'Is stump grinding better than stump removal?',
        a: 'For most residential properties, professional stump grinding is preferred because it removes visible stump material below grade with less disruption than full root excavation.',
      },
      {
        q: 'How deep should a stump be ground?',
        a: 'Depth depends on your project goals, including sod, replanting, or hardscape. We set grinding depth based on the intended finish use.',
      },
      {
        q: 'Can roots continue growing after stump grinding?',
        a: 'Some species may attempt limited regrowth, but proper tree stump grinding services significantly reduce sprouting and improve long-term landscape control.',
      },
      {
        q: 'Will stump grinding damage my lawn?',
        a: 'With controlled machine positioning, turf planning, and cleanup methods, lawn impact is typically limited and manageable.',
      },
      {
        q: 'Can I plant grass after stump grinding?',
        a: 'Yes. After chip management and finish grading, many sites are suitable for turf recovery or sod preparation.',
      },
      {
        q: 'Can you grind stumps near irrigation?',
        a: 'Yes. Irrigation head awareness and utility-conscious planning are part of our process before grinding starts.',
      },
      {
        q: 'Do you service waterfront properties?',
        a: 'Yes. We provide waterfront stump grinding with planning around seawalls, docks, pavers, and tight access.',
      },
      {
        q: 'Do you provide stump grinding throughout Volusia County?',
        a: 'Yes. TREE TEK provides residential stump grinding and property-focused service throughout Volusia County.',
      },
    ];
    const volusiaStumpFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: volusiaStumpFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const checklistCards = [
      'After tree removal',
      'Before installing sod',
      'Before replanting',
      'Before landscape redesign',
      'When pests are present',
      'When sprouts keep returning',
      'Near walkways or driveways',
      'Before fence or hardscape work',
    ];
    const trustCards = [
      'Professional Equipment',
      'Waterfront Property Experience',
      'Careful Lawn Protection',
      'Local Volusia County Knowledge',
      'Clean Worksites',
      'Responsive Communication',
      'Licensed & Insured',
      'Property Protection Focused',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={volusiaStumpFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Professional Stump Grinding in Volusia County, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Old stumps can attract pests, create trip hazards, damage mowers, and block new landscaping. TREE
                    TEK provides professional stump grinding for residential, waterfront, and high-value properties
                    throughout Volusia County with careful equipment placement and clean below-grade results.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-white/5 p-1">
                  <img
                    src="/images/south-daytona-stump-grinding-service-tree-tek-florida.png"
                    alt="TREE TEK professional stump grinding service in Volusia County Florida"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Remove a Tree Stump?</h2>
              <p className="text-gray-700 leading-relaxed">
                Old stumps can become pest habitat, trigger unwanted sprouting, create mower damage and trip hazards,
                reduce curb appeal, and block replanting plans. They can also complicate irrigation adjustments, lawn
                restoration, and broader landscape redesign across residential stump grinding projects.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">The Science Behind Stump Grinding</h2>
              <p className="text-gray-700 leading-relaxed">
                Professional stump grinding removes the visible stump and upper root flare below grade while deeper
                roots naturally decompose underground. This restores usable surface area without unnecessary excavation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Root flare reduction, organic decomposition, and gradual soil settling all influence turf recovery, sod
                preparation, and future replanting decisions. For homeowners searching stump grinding near me, these
                planning details help deliver clean long-term results.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Protecting Lawns, Irrigation &amp; Landscaping</h2>
              <p className="text-gray-700 leading-relaxed">
                TREE TEK plans each job with irrigation head awareness, turf protection, controlled machine positioning,
                bed and hardscape care, debris containment, and final cleanup. This approach supports professional stump
                grinding and stump removal Volusia County outcomes without unnecessary site disturbance. For homeowners
                comparing stump grinding Volusia County FL options, this process helps protect long-term property quality.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Stump Grinding for Waterfront &amp; High-Value Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront stump grinding often requires planning around seawalls, docks, pools, pavers, irrigation
                systems, and luxury landscaping. On tight-access properties, TREE TEK coordinates equipment access,
                staging, and controlled debris handling to protect surrounding property features.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">When Should a Stump Be Removed?</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {checklistCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Volusia County Homeowners Choose TREE TEK</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Tree &amp; Landscape Science Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'UF/IFAS Gardening Solutions', href: 'https://gardeningsolutions.ifas.ufl.edu/' },
                  { title: 'International Society of Arboriculture', href: 'https://www.isa-arbor.com/' },
                  { title: 'Florida-Friendly Landscaping', href: 'https://ffl.ifas.ufl.edu/' },
                  { title: 'Tree Care Industry Association', href: 'https://treecareindustryassociation.org/' },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {volusiaStumpFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isStumpGrinding) {
    const stumpFaqs = [
      {
        q: 'Is stump grinding better than stump removal?',
        a: 'In most residential cases, professional stump grinding is the preferred approach because it removes the visible stump and upper root structure with less disruption than full excavation.',
      },
      {
        q: 'Can roots continue growing after stump grinding?',
        a: 'Some species may attempt limited sprouting, but proper grinding depth significantly reduces regrowth and allows better long-term landscape control.',
      },
      {
        q: 'Will stump grinding damage my lawn?',
        a: 'When done with proper access planning, ground-pressure control, and cleanup methods, turf impact is typically limited and recoverable.',
      },
      {
        q: 'How deep should a stump be ground?',
        a: 'Depth depends on your project goals, such as sod installation, planting, or hardscape work. TREE TEK sets target depth based on intended use.',
      },
      {
        q: 'Can you grind stumps near seawalls or docks?',
        a: 'Yes. Waterfront stump grinding requires careful equipment placement and debris control to protect surrounding structures and landscape investments.',
      },
      {
        q: 'Does stump grinding help prevent pests?',
        a: 'Reducing decaying stump material can lower conditions that attract pests and fungi over time, especially in warm, humid climates.',
      },
      {
        q: 'Can I plant grass after stump grinding?',
        a: 'Yes. With proper chip management, soil adjustment, and grading, many areas can be prepared for turf recovery or sod installation.',
      },
      {
        q: 'Do you service waterfront homes in Port Orange?',
        a: 'Yes. TREE TEK services Port Orange waterfront and canal-side properties with controlled stump grinding and property-protection planning.',
      },
    ];
    const stumpFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: stumpFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const assessmentCards = [
      'Tree health',
      'Structural stability',
      'Root plate movement',
      'Storm history',
      'Proximity to structures',
      'Access for equipment',
      'Crane or rigging requirements',
      'Property protection needs',
    ];
    const resourceCards = [
      {
        title: 'UF/IFAS Landscaping Resources',
        desc: 'Florida-based landscape and soil guidance from the University of Florida IFAS Extension.',
        href: 'https://gardeningsolutions.ifas.ufl.edu/',
      },
      {
        title: 'International Society of Arboriculture (ISA)',
        desc: 'Industry-leading arboriculture education and tree care standards.',
        href: 'https://www.isa-arbor.com/',
      },
      {
        title: 'Florida-Friendly Landscaping™',
        desc: 'Research-backed landscaping practices for Florida properties.',
        href: 'https://ffl.ifas.ufl.edu/',
      },
      {
        title: 'Tree Care Industry Association (TCIA)',
        desc: 'Professional tree care safety and operational standards.',
        href: 'https://treecareindustryassociation.org/',
      },
      {
        title: 'ANSI A300 Tree Care Standards',
        desc: 'Recognized standards for professional tree care practices.',
        href: 'https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx',
      },
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={stumpFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • PORT ORANGE • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Professional Stump Grinding in Port Orange &amp; Volusia County</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Premium tree stump grinding services for high-value residential and waterfront properties. TREE TEK
                    combines precision equipment, controlled site planning, and science-backed methods to support long-term
                    landscape performance.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-emerald-200/30 shadow-2xl">
                  <img
                    src={resolvePublicHeroImage(page.heroImage) || DEFAULT_HERO_IMAGE}
                    alt={page.heroImageAlt ?? 'stump grinding Port Orange FL by TREE TEK'}
                    className="w-full h-[260px] md:h-[420px] object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Stumps Cause Long-Term Landscape Problems</h2>
              <p className="text-gray-700 leading-relaxed">
                Decaying wood retains moisture, and remaining stump material can attract termites, ants, beetles, and
                fungi over time. Root systems may continue sprouting, decomposition can change soil structure, and old
                roots may interfere with future landscaping, irrigation adjustments, and hardscape planning.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                According to{' '}
                <a href="https://gardeningsolutions.ifas.ufl.edu/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                  UF/IFAS landscaping guidance
                </a>
                , decaying stump material can contribute to pest activity and complicate future landscape planning.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">The Science Behind Stump Grinding</h2>
                <p className="text-gray-700 leading-relaxed">
                  Professional stump grinding focuses on removing the visible stump and upper root flare while minimizing
                  unnecessary disturbance to surrounding landscape zones. Surface root reduction supports future turf and
                  planting work while allowing organic decomposition of deeper roots underground.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Complete root excavation is usually unnecessary in residential settings. Post-grind settling can occur as
                organic material breaks down, so finish grading and soil adjustment are part of preparing for sod
                recovery, replanting, or new landscape design. For homeowners searching stump grinding near me, these
                details are often the difference between short-term cleanup and long-term landscape performance.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Protecting Soil, Turf, and Irrigation Systems</h2>
              <p className="text-gray-700 leading-relaxed">
                TREE TEK evaluates irrigation systems and surrounding landscape features before beginning grinding
                operations. Controlled equipment placement, ground-pressure management, irrigation marking, root tracing,
                debris containment, and structured cleanup help reduce turf disruption and preserve landscape performance.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Professional Equipment Matters</h2>
                <p className="text-gray-700 leading-relaxed">
                  Commercial-grade stump grinders provide controlled cutting depth, cleaner finish quality, reduced turf
                  disruption, safer operation near structures, and better access management in tight locations.
                  Professional equipment allows more precise stump removal compared to rental-grade machines.
                </p>
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Stump Grinding for Waterfront Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront stump grinding in Port Orange requires additional planning around seawalls, docks, pavers,
                irrigation systems, decorative landscaping, and tight-access lots. TREE TEK uses controlled debris
                management, access planning, and lawn preservation methods to protect surrounding landscape investments.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What TREE TEK Looks For During an Assessment</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {assessmentCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Educational Tree &amp; Landscape Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {resourceCards.map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {stumpFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isTreeMaintenanceGuide) {
    const maintenanceFaqs = [
      {
        q: 'How often should Florida trees be inspected?',
        a: 'At minimum, homeowners should perform routine visual checks seasonally and after major weather events. Professional inspections are recommended when risk indicators are present.',
      },
      {
        q: 'What is the best mulch for trees in Florida?',
        a: 'Organic mulch is generally preferred when applied correctly in a wide ring that stays away from the trunk. Avoid volcano mulching that traps moisture against bark.',
      },
      {
        q: 'Is tree topping bad for trees?',
        a: 'Yes. Topping can stress trees, trigger weak regrowth, increase decay risk, and reduce long-term structural integrity.',
      },
      {
        q: 'How often should trees be pruned?',
        a: 'Pruning intervals vary by species, age, growth rate, and risk profile. Structural and risk-focused pruning is typically scheduled on a cycle rather than arbitrary frequent cuts.',
      },
      {
        q: 'Can overwatering damage tree roots?',
        a: 'Yes. Overwatering can limit oxygen in the soil, stress root systems, and increase susceptibility to decline.',
      },
      {
        q: 'How do I prepare trees for hurricane season?',
        a: 'Pre-season preparation includes removing deadwood, evaluating weak branch unions, reducing hazardous overextended limbs, and checking root-zone stability.',
      },
      {
        q: 'What are signs a tree may be unsafe?',
        a: 'Common warning signs include dead branches, trunk cracks, root plate movement, sudden lean, repeated limb failure, and fungal growth near the base.',
      },
      {
        q: 'Do waterfront trees need special care?',
        a: 'Yes. Waterfront tree care often requires planning for salt exposure, wind loading, constrained root space, and tight access conditions.',
      },
      {
        q: 'When should I call a professional tree service?',
        a: 'Call a professional when visible defects, site targets, occupancy, and weather exposure combine to create elevated tree risk.',
      },
    ];
    const maintenanceFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: maintenanceFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.h1,
      description: page.metaDescription,
      author: {
        '@type': 'Organization',
        name: 'TREE TEK',
      },
      publisher: {
        '@type': 'Organization',
        name: 'TREE TEK',
      },
      mainEntityOfPage: absoluteUrl(path),
      image: resolvePublicHeroImage(page.heroImage),
    };
    const decliningSigns = [
      'Dead branches',
      'Sparse canopy',
      'Fungal growth near base',
      'Cracks in trunk',
      'Sudden lean',
      'Exposed or lifting roots',
      'Peeling bark',
      'Repeated limb failure',
      'Soft or hollow wood',
      'Soil mounding near root plate',
    ];
    const seasonalCards = [
      {
        season: 'Spring',
        items: 'Inspect new growth, prune deadwood, and check irrigation coverage.',
      },
      {
        season: 'Summer',
        items: 'Monitor drought stress, prepare for storms, and avoid unnecessary heavy pruning.',
      },
      {
        season: 'Fall',
        items: 'Inspect storm damage, clean up broken limbs, and evaluate structural issues.',
      },
      {
        season: 'Winter',
        items: 'Plan structural pruning, assess tree health, and schedule removals if needed.',
      },
    ];
    const helpCards = [
      'Tree trimming and pruning',
      'Storm cleanup',
      'Tree risk evaluation',
      'Tree removal',
      'Crane-assisted tree work',
      'Stump grinding',
      'Waterfront property protection',
      'Emergency tree service',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        <JsonLd data={maintenanceFaqLd} />
        <JsonLd data={articleLd} />
        <JsonLd
          data={getServicePageSchema({
            name: 'Tree maintenance and risk evaluation',
            description: page.metaDescription,
            path,
            areaServed: 'Volusia County, FL and Port Orange, FL',
          })}
        />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Tree Maintenance Guide for Florida Homeowners</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Healthy trees need more than occasional trimming. Florida&apos;s heat, sandy soils, salt exposure,
                    saturated storm seasons, and hurricane winds all affect tree structure, roots, canopy health, and
                    long-term safety. This TREE TEK guide explains science-based tree maintenance practices that help
                    homeowners protect trees, property, and people.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="w-full rounded-2xl overflow-hidden border border-emerald-200/30 shadow-2xl bg-white/5 p-1">
                  <img
                    src="/images/Tree-Maintenance-Guide-for-Florida-Homeowners-Science-Based-Tree-Health-and-Storm-Protection.png"
                    alt="TREE TEK tree maintenance guide for Florida homeowners science-based tree health and storm protection"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-emerald-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Guide Contents</h2>
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700">
                {[
                  'Florida Tree Maintenance Basics',
                  'Why Florida Trees Need Specialized Care',
                  'Proper Mulching: Protect the Root Zone',
                  'Watering and Root Health',
                  'Science-Based Pruning',
                  'Why Tree Topping Is Harmful',
                  'Storm Preparation for Florida Trees',
                  'Signs a Tree May Be Declining',
                  'Protecting Trees on Waterfront Properties',
                  'Tree Risk and When to Call a Professional',
                  'Seasonal Florida Tree Maintenance Checklist',
                  'What TREE TEK Helps With',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Florida Tree Maintenance Basics</h2>
              <p className="text-gray-700 leading-relaxed">
                Effective tree care Florida homeowners can rely on starts with routine observation, seasonal pruning,
                proper watering, mulch placement, soil compaction awareness, root zone protection, storm preparation,
                and ongoing tree risk monitoring. A structured maintenance cycle supports long-term canopy health and
                safer properties in Volusia County.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Florida Trees Need Specialized Care</h2>
              <p className="text-gray-700 leading-relaxed">
                Florida conditions differ from many inland regions: sandy soils drain quickly, heavy rains can saturate
                root zones, hurricanes increase wind loading, coastal salt exposure stresses foliage, heat raises water
                demand, and urban soils are often compacted. A science-based tree care plan helps balance growth, root
                stability, and storm resilience.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Proper Mulching: Protect the Root Zone</h2>
              <p className="text-gray-700 leading-relaxed">
                Mulch should be applied in a broad ring and should not touch the trunk. Avoid volcano mulching, which
                can trap moisture against bark and promote decay and pests. Proper mulch depth helps moderate soil
                temperature and retain moisture. UF/IFAS guidance supports these practices as part of healthy Florida
                root-zone management.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Watering and Root Health</h2>
              <p className="text-gray-700 leading-relaxed">
                Overwatering can reduce oxygen in soil and stress roots, while underwatering can weaken canopy function
                and growth. New trees need consistent establishment watering; mature trees often perform better with
                deeper, less frequent irrigation. Saturated soils after storms may temporarily reduce root stability and
                increase failure potential.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Science-Based Pruning</h2>
              <p className="text-gray-700 leading-relaxed">
                Tree pruning Florida best practices include respecting branch collars, removing deadwood, improving
                structure, reducing weak attachments, improving clearance, and supporting airflow where appropriate.
                ISA and ANSI A300 standards provide guidance for pruning quality and risk-aware tree care.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Tree Topping Is Harmful</h2>
              <p className="text-gray-700 leading-relaxed">
                Topping can create severe stress, weakly attached regrowth, increased decay risk, and excessive canopy
                loss. These effects can shorten tree lifespan and increase future storm risk rather than reducing it.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Storm Preparation for Florida Trees</h2>
              <p className="text-gray-700 leading-relaxed">
                Pre-season planning should include deadwood removal, weak branch union checks, root plate monitoring,
                reduction of hazardous overextended limbs, and prudent clearance near rooflines. Avoid over-thinning
                canopies, which may reduce structural performance during hurricane tree preparation cycles.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Signs a Tree May Be Declining</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {decliningSigns.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Protecting Trees on Waterfront Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront tree care needs special attention to salt exposure, wind loading, constrained root space near
                seawalls, irrigation balance, turf compaction, dock access limits, and storm surge effects. Planning
                these factors supports healthier trees and safer coastal properties.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Tree Risk and When to Call a Professional</h2>
              <p className="text-gray-700 leading-relaxed">
                Professional assessment is appropriate when defects, targets, occupancy, and site conditions create
                elevated risk. ISA Tree Risk Assessment principles evaluate likelihood of failure, consequences, visible
                defects, site conditions, and target exposure to support informed decisions.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Seasonal Florida Tree Maintenance Checklist</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {seasonalCards.map((item) => (
                  <div key={item.season} className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                    <h3 className="font-bold text-gray-900">{item.season}</h3>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.items}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What TREE TEK Helps With</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {helpCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Science-Based Tree Care Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'UF/IFAS Tree Care Resources', href: 'https://hort.ifas.ufl.edu/woody/' },
                  { title: 'UF/IFAS Gardening Solutions', href: 'https://gardeningsolutions.ifas.ufl.edu/' },
                  { title: 'International Society of Arboriculture', href: 'https://www.isa-arbor.com/' },
                  { title: 'ANSI A300 Tree Care Standards', href: 'https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx' },
                  { title: 'Florida-Friendly Landscaping', href: 'https://ffl.ifas.ufl.edu/' },
                  { title: 'Florida Forest Service Urban & Community Forestry', href: 'https://www.fdacs.gov/Forest-Wildfire/Our-Forests/Urban-and-Community-Forestry' },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {maintenanceFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isWhenToRemoveTree) {
    const treeFaqs = [
      {
        q: 'How do I know if a tree is dangerous?',
        a: 'Warning signs include structural cracking, advanced decay, root plate movement, repeated limb failure, and major canopy decline near occupied areas.',
      },
      {
        q: 'Can a leaning tree be saved?',
        a: 'Sometimes. A professional assessment can determine whether pruning, cabling, or bracing is viable, or whether removal is safer.',
      },
      {
        q: 'Should I remove a tree after storm damage?',
        a: 'Not always. Some storm-damaged trees can be stabilized, while others with severe structural failure should be removed quickly.',
      },
      {
        q: 'What causes trees to fail during hurricanes?',
        a: 'Saturated soils, hidden root decay, structural defects, and high wind loads are common contributors to failure during storms.',
      },
      {
        q: 'Do you service waterfront properties in Port Orange?',
        a: 'Yes. TREE TEK plans removals for seawalls, docks, pools, pavers, fencing, and other high-value waterfront features.',
      },
      {
        q: 'Can TREE TEK remove trees with a crane?',
        a: 'Yes. We use crane-assisted removal when site constraints or risk conditions make controlled lifting the safest method.',
      },
    ];
    const treeFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: treeFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const riskCards = [
      'Large dead limbs over the home',
      'Tree leaning after heavy rain or wind',
      'Hollow or cracked trunk',
      'Roots lifting or separating from soil',
      'Fungus, rot, or soft wood near the base',
      'Canopy decline or major dead sections',
      'Storm damage affecting stability',
      'Tree interfering with rooflines, seawalls, driveways, or utilities',
    ];
    const assessmentCards = [
      'Tree health',
      'Structural stability',
      'Root plate movement',
      'Storm history',
      'Proximity to structures',
      'Access for equipment',
      'Crane or rigging requirements',
      'Property protection needs',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        <JsonLd data={treeFaqLd} />
        <JsonLd
          data={getServicePageSchema({
            name: 'Tree risk evaluation and removal planning',
            description: page.metaDescription,
            path,
            areaServed: 'Port Orange, FL and Volusia County, FL',
          })}
        />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">TREE TEK • VOLUSIA COUNTY</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">When to Remove a Tree in Port Orange, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Tree removal is not always the first option. TREE TEK helps Port Orange homeowners understand when a
                    tree can be preserved through pruning, cabling, or health care — and when removal is the safest
                    choice for your home, waterfront property, driveway, roofline, or family.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
                <div className="w-full rounded-2xl overflow-hidden border border-emerald-200/30 shadow-2xl bg-white/5 p-1">
                  <img
                    src="/images/When-To-Remove-A-Tree-In-Port-Orange-FL.png"
                    alt="TREE TEK assessing when to remove a tree in Port Orange FL"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Signs a Tree May Need to Be Removed</h2>
                <p className="text-gray-700 leading-relaxed">
                  When to remove a tree in Port Orange FL often comes down to structural risk, not appearance alone.
                  Advanced decay, hollow trunks, trunk cracking, severe lean, root plate movement, repeated limb
                  failure, fungal growth, storm damage, declining canopy health, and tree-to-structure conflicts can
                  all indicate elevated failure potential.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {riskCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-700 shrink-0" aria-hidden />
                      <span className="text-sm text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Tree Failure Happens in Florida</h2>
              <p className="text-gray-700 leading-relaxed">
                Saturated soils can reduce root stability, while hurricanes and tropical storms rapidly increase failure
                risk. Root decay is frequently hidden underground, and leaning after storms may indicate root plate
                failure rather than a temporary shift. Over time, salt exposure and compacted soils can further stress
                trees and reduce structural resilience.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                According to{' '}
                <a href="https://hort.ifas.ufl.edu/woody/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                  UF/IFAS
                </a>{' '}
                and{' '}
                <a href="https://www.isa-arbor.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                  ISA
                </a>{' '}
                guidance, structural defects and root instability are among the most common contributors to tree failure
                during storms.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Removal Is Sometimes the Safest Option</h2>
              <p className="text-gray-700 leading-relaxed">
                TREE TEK evaluates surrounding structures, target zones, occupancy, equipment access, species-specific
                failure tendencies, storm exposure, root stability, and waterfront constraints before recommending
                removal. This is especially important in Port Orange waterfront properties and mature neighborhoods where
                hurricane exposure and saturated soils can increase consequence levels.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Not Every Tree Should Be Removed</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pruning, cabling, bracing, soil improvements, deadwood removal, and monitoring can often preserve
                  structurally sound trees safely.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                <a href="https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                  ANSI A300
                </a>{' '}
                pruning standards and{' '}
                <a href="https://www.isa-arbor.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                  ISA best practices
                </a>{' '}
                support preservation whenever acceptable structural integrity remains.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Professional Tree Risk Evaluation Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                Visual symptoms do not always reveal internal decay. A professional tree risk evaluation considers
                failure likelihood, target assessment, occupancy, species behavior, structural defects, storm history,
                and root conditions. TREE TEK follows industry-recognized principles inspired by ISA Tree Risk
                Assessment best practices to guide recommendations.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Tree Removal for Waterfront and High-Value Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront tree removal in Port Orange requires precision around seawalls, dock access, irrigation
                systems, pavers, landscaping, pools, fences, and rooflines. TREE TEK uses crane-assisted removals,
                controlled rigging and lowering techniques, and turf protection mats to reduce collateral impact.
                Waterfront removals demand planning, precision, and property protection at every stage.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What TREE TEK Looks For During an Assessment</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {assessmentCards.map((item) => (
                    <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-emerald-700" aria-hidden />
                        <span className="text-sm font-semibold text-gray-800">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Can the Tree Be Saved?</h2>
                <p className="text-gray-700 leading-relaxed">
                  In many cases, preservation is appropriate when structural integrity remains acceptable. Pruning,
                  cabling, selective reduction, soil remediation, and monitoring can reduce risk while preserving shade
                  and landscape value. TREE TEK recommends removal only when risk outweighs preservation.
                </p>
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-8 shadow-xl ring-1 ring-emerald-800/60">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Schedule a Tree Risk Evaluation in Port Orange</h2>
              <p className="mt-4 text-emerald-50/95 leading-relaxed text-center">
                Concerned about a leaning, damaged, or declining tree? TREE TEK can inspect the tree and explain whether
                removal, pruning, or another solution is the safest option for your property.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/quote" className="inline-flex justify-center items-center rounded-xl bg-white text-emerald-950 font-bold px-6 py-3 hover:bg-emerald-50 transition">
                  Request a Free Quote
                </Link>
                <a href={telHref} className="inline-flex justify-center items-center rounded-xl border border-white/80 bg-emerald-800/35 text-white font-bold px-6 py-3 hover:bg-emerald-800/60 transition">
                  Call 321-282-9795
                </a>
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {treeFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-emerald-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Educational Resources</h2>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <a href="https://www.isa-arbor.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                    International Society of Arboriculture
                  </a>
                </li>
                <li>
                  <a href="https://hort.ifas.ufl.edu/woody/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                    UF/IFAS Tree Care Resources
                  </a>
                </li>
                <li>
                  <a href="https://www.fdacs.gov/Forest-Wildfire/Our-Forests/Urban-and-Community-Forestry" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                    Florida Forest Service
                  </a>
                </li>
                <li>
                  <a href="https://www.treecareindustry.org/TCIA/Resources/Industry_Standards/ANSI_A300_Standards.aspx" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                    ANSI A300 Tree Care Standards
                  </a>
                </li>
              </ul>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isEmergencyTreeServiceDaytona) {
    const daytonaEmergencyFaqs = [
      {
        q: 'What qualifies as a tree emergency?',
        a: 'Tree emergencies usually include fallen trees, large hanging limbs, split trunks, unstable lean after storms, and blocked access routes creating immediate safety risk.',
      },
      {
        q: 'Can you remove fallen trees after storms?',
        a: 'Yes. TREE TEK provides storm damaged tree removal and fallen tree removal after severe weather conditions.',
      },
      {
        q: 'Is a leaning tree dangerous after heavy rain?',
        a: 'It can be. Leaning after wind or rain may indicate compromised roots or trunk instability and should be inspected quickly.',
      },
      {
        q: 'Can TREE TEK remove trees from roofs?',
        a: 'Yes. We perform controlled emergency tree removal from roof-impact sites using careful cutting and debris handling methods.',
      },
      {
        q: 'Do you provide emergency cleanup in Daytona Beach?',
        a: 'Yes. We provide emergency storm cleanup and hazardous tree removal support throughout Daytona Beach and nearby Volusia County areas.',
      },
      {
        q: 'Can storm-damaged trees fail later?',
        a: 'Yes. Storm-related tree failures may not always be immediately visible after severe weather events, so delayed limb or stem failure can occur.',
      },
      {
        q: 'Do you help waterfront homes after storms?',
        a: 'Yes. We plan emergency cleanup around waterfront constraints such as seawalls, docks, pavers, and limited access points.',
      },
      {
        q: 'Do you provide crane-assisted emergency removals?',
        a: 'Yes. Emergency crane-assisted support is available when high-risk picks or restricted drop zones require lifting control.',
      },
    ];
    const daytonaEmergencyFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: daytonaEmergencyFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const processSteps = [
      'Hazard assessment',
      'Secure work zones',
      'Prioritize life safety',
      'Remove immediate hazards',
      'Controlled debris cutting',
      'Protect surrounding property',
      'Debris staging and hauling',
      'Final cleanup',
    ];
    const signsCards = [
      'Tree on house',
      'Large hanging limb',
      'Cracked or split trunk',
      'Leaning tree after storm',
      'Blocked driveway',
      'Uprooted tree',
      'Tree touching structure',
      'Debris blocking access',
    ];
    const trustCards = [
      'Rapid Emergency Response',
      'Professional Equipment',
      'Waterfront Property Experience',
      'Controlled Removal Methods',
      'Careful Property Protection',
      'Local Volusia County Knowledge',
      'Clean Worksites',
      'Licensed & Insured',
    ];

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={daytonaEmergencyFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">DAYTONA BEACH • TREE TEK</p>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Emergency Tree Service in Daytona Beach, FL</h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-2xl">
                    Fast-moving squalls, tropical systems, and hurricane-force winds can leave Daytona Beach properties
                    with split trees, hanging limbs, blocked driveways, and dangerous storm debris. TREE TEK provides
                    emergency tree service with rapid hazard assessment, controlled removals, debris cleanup, and
                    careful property protection throughout Daytona Beach and Volusia County.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-md">
                      Request a Free Quote
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/40 transition">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-white/5 p-1">
                  <img
                    src={resolvePublicHeroImage(page.heroImage) || '/images/Emergency-Tree-Service-Daytona-Beach-FL.png'}
                    alt={page.heroImageAlt ?? 'TREE TEK emergency tree service in Daytona Beach Florida'}
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/images/Emergency-Tree-Service-Daytona-Beach-FL.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What Emergency Tree Service Includes</h2>
              <p className="text-gray-700 leading-relaxed">
                Emergency tree service Daytona Beach FL calls often involve fallen tree removal, hanging limb removal,
                emergency storm cleanup, driveway and roadway clearing, hazard reduction, controlled cutting, roof and
                structure protection, and emergency crane or grapple truck support.
              </p>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Storm-Damaged Trees Become Dangerous</h2>
              <p className="text-gray-700 leading-relaxed">
                Storm exposure can create cracked trunks, split branch unions, saturated root zones, root plate
                movement, hanging limbs, and delayed limb failure. Structural instability may continue after winds
                subside. Storm-related tree failures may not always be immediately visible after severe weather events.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">TREE TEK Emergency Response Process</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {processSteps.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Emergency Tree Service for Waterfront &amp; High-End Properties</h2>
              <p className="text-gray-700 leading-relaxed">
                Waterfront and luxury properties require careful planning around seawalls, docks, pools, pavers,
                irrigation systems, and landscape features. TREE TEK coordinates tight-access lots, equipment staging,
                and controlled debris handling for emergency tree removal without unnecessary site impact.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Signs You Need Emergency Tree Service</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {signsCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
                      <span className="text-sm font-semibold text-gray-800">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Daytona Beach Homeowners Choose TREE TEK</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map((item) => (
                  <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm font-semibold text-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Storm Damage &amp; Emergency Tree Safety Resources</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: 'International Society of Arboriculture',
                    href: 'https://www.isa-arbor.com/',
                  },
                  {
                    title: 'UF/IFAS Tree Care Resources',
                    href: 'https://hort.ifas.ufl.edu/woody/',
                  },
                  {
                    title: 'National Hurricane Center Preparedness',
                    href: 'https://www.nhc.noaa.gov/prepare/ready.php',
                  },
                  {
                    title: 'Florida Division of Emergency Management',
                    href: 'https://www.floridadisaster.org/',
                  },
                ].map((r) => (
                  <a
                    key={r.title}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-4 hover:bg-emerald-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <ExternalLink className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {daytonaEmergencyFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>
        </article>
      </>
    );
  }

  if (isEmergencyTreeService) {
    const emergencyFaqs = [
      {
        q: 'How quickly can TREE TEK respond to an emergency?',
        a: 'Response time depends on weather, call volume, and your location, but we prioritize active safety hazards and blocked access first.',
      },
      {
        q: 'Do you offer 24/7 emergency tree service?',
        a: 'Yes. TREE TEK provides 24/7 emergency tree response across Port Orange and Volusia County.',
      },
      {
        q: 'Can you remove trees near homes, roofs, or pool enclosures?',
        a: 'Yes. We plan controlled removal methods for dangerous tree removal near homes, roofs, pool enclosures, and tight access areas.',
      },
      {
        q: 'Do you handle storm damage cleanup?',
        a: 'Yes. We handle storm damage cleanup Port Orange homeowners need after high winds, hurricanes, and severe rain events.',
      },
      {
        q: 'What areas do you serve?',
        a: 'We serve Port Orange, Daytona Beach, South Daytona, Ormond Beach, New Smyrna Beach, Edgewater, Ponce Inlet, and nearby Volusia County communities.',
      },
      {
        q: 'Can you help with insurance documentation?',
        a: 'We can provide photos and service details that may help with insurance claim discussions, but we do not promise claim outcomes.',
      },
      {
        q: 'What qualifies as a tree emergency?',
        a: 'Fallen trees, hanging limbs, split trunks, leaning trees after storms, and blocked driveways or emergency access are common emergency situations.',
      },
      {
        q: 'Do you remove fallen trees after hurricanes?',
        a: 'Yes. We provide hurricane tree cleanup and tree removal after storm conditions when trees threaten safety or property.',
      },
      {
        q: 'Can you clear blocked driveways or access roads?',
        a: 'Yes. We provide rapid clearing for blocked driveways, roads, and access points when storm debris creates safety concerns.',
      },
    ];
    const emergencyFaqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: emergencyFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
    const trustCards = [
      'Licensed & Insured',
      'Fast Emergency Dispatch',
      'Local Volusia County Crew',
      'Property Protection Focused',
      'Crane-Assisted Removal Available',
      'Insurance Documentation Support',
      'Professional Cleanup',
      'Clear Communication',
    ];
    const helpCards = [
      ['Rapid Response', 'We dispatch quickly to your location.', Truck],
      ['Safety First', 'We secure the area and reduce risk.', ShieldAlert],
      ['Remove & Clear', 'We remove trees, limbs, and debris fast.', Wrench],
      ['Protect Property', 'We help prevent further damage.', Home],
      ['Clean & Restore', 'We clean up and restore your space.', Trees],
      ['We’re Here 24/7', 'Day, night, weekends, and holidays.', Clock3],
      ['Licensed & Insured', 'Fully insured for your protection.', ShieldCheck],
      ['Experienced Crew', 'Skilled professionals for dangerous situations.', UserCheck],
      ['Emergency Equipment', 'The right tools for efficient work.', Wrench],
      ['Local Experts', 'We know Port Orange and Volusia County.', MapPin],
      ['Trusted by Neighbors', 'Homeowners rely on TREE TEK.', HeartHandshake],
      ['Compassionate Service', 'We understand stressful situations.', LifeBuoy],
    ] as const;

    return (
      <>
        <SEO title={page.metaTitle} description={page.metaDescription} keywords={keywords} path={path} image={resolvePublicHeroImage(page.heroImage)} />
        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        <JsonLd data={emergencyFaqLd} />

        <article className="bg-emerald-50/40">
          <section className="relative overflow-visible">
            <div className="max-w-6xl mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                <div className="relative z-20">
                  <p className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-800 shadow-sm">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden />
                    24/7 Emergency Tree Response
                  </p>
                  <h1 className="mt-5 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                    Emergency Tree Service in Port Orange &amp; Volusia County
                  </h1>
                  <p className="mt-5 text-slate-700 leading-relaxed max-w-xl">
                    Fast emergency tree removal, storm cleanup, hazardous limb removal, and hurricane response services
                    across Port Orange, Daytona Beach, South Daytona, and surrounding Volusia County areas.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to="/quote" className="inline-flex items-center justify-center bg-emerald-800 text-white font-bold py-3 px-7 rounded-lg hover:bg-emerald-700 transition shadow-md">
                      Get Emergency Help Now
                    </Link>
                    <a href={telHref} className="inline-flex items-center justify-center bg-white hover:bg-emerald-50 text-emerald-900 font-bold py-3 px-7 rounded-lg border border-emerald-200 transition shadow-sm">
                      Call 321-282-9795
                    </a>
                  </div>
                </div>

                <div className="relative min-h-[320px] md:min-h-[460px] rounded-3xl border border-emerald-300/20 shadow-xl bg-gradient-to-br from-emerald-900/85 via-emerald-950/75 to-emerald-900/80 p-6 md:p-8">
                  <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide">Emergency Operations Panel</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['24/7 ACTIVE', 'RAPID DISPATCH', 'STORM READY', 'HAZARD FIRST'].map((item) => (
                      <div key={item} className="rounded-lg border border-emerald-300/25 bg-emerald-900/40 px-3 py-2 text-emerald-50 text-sm font-semibold">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-900/40 p-4 text-emerald-50">
                    <p className="text-sm leading-relaxed">
                      TREE TEK emergency crews are dispatched across Port Orange and Volusia County for emergency tree
                      removal, storm damage cleanup, and dangerous tree stabilization near homes and access routes.
                    </p>
                  </div>
                  <a
                    href={telHref}
                    className="mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 text-white font-bold px-5 py-3 hover:bg-red-700 transition"
                  >
                    Call 321-282-9795
                  </a>
                </div>
              </div>
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Fast Emergency Tree Response Matters</h2>
              <p className="text-gray-700 leading-relaxed">
                Unstable trees, cracked trunks, hanging limbs, and storm-damaged branches can shift suddenly after wind,
                rain, or hurricane conditions. Fast emergency response helps reduce risk around blocked driveways,
                damaged roofs, vehicles, fences, pool enclosures, and emergency access routes.
              </p>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Emergency Tree Response Capabilities</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  TREE TEK responds to urgent tree hazards with organized dispatch, trained crews, and emergency-ready
                  equipment across Port Orange and Volusia County.
                </p>
                <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        title: 'Storm Damage Cleanup',
                        body: 'Fast clearing of broken limbs, fallen branches, and storm debris after severe weather.',
                        Icon: AlertTriangle,
                      },
                      {
                        title: 'Hazardous Tree Removal',
                        body: 'Controlled removal planning for cracked, leaning, split, or unstable trees near structures.',
                        Icon: ShieldAlert,
                      },
                      {
                        title: 'Blocked Access Clearing',
                        body: 'Driveways, roads, sidewalks, gates, and emergency access routes cleared quickly.',
                        Icon: Truck,
                      },
                      {
                        title: 'Emergency Limb Removal',
                        body: 'Removal of hanging limbs, broken branches, and dangerous canopy damage.',
                        Icon: Wrench,
                      },
                      {
                        title: 'Crane-Assisted Removal',
                        body: 'Support for high-risk removals near roofs, pools, fences, and tight spaces.',
                        Icon: Landmark,
                      },
                      {
                        title: 'Insurance Documentation Support',
                        body: 'Photos and service notes that may help with storm claim conversations.',
                        Icon: FileCheck2,
                      },
                    ].map(({ title, body, Icon }) => (
                      <div key={title} className="rounded-xl border border-emerald-100 bg-emerald-50/35 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <Icon className="h-5 w-5 text-emerald-700" aria-hidden />
                          <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                            Emergency Ready
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold text-gray-900">{title}</h3>
                        <p className="mt-1 text-sm text-gray-700 leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>

                  <aside className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Live Response Status</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                        <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden />
                        ACTIVE
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      {[
                        ['24/7 Emergency Intake', 'Active'],
                        ['Dispatch Priority', 'Hazard First'],
                        ['Service Area', 'Volusia County'],
                        ['Equipment', 'Rigging / Saw / Crane Support'],
                        ['Phone Response', '321-282-9795'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                          <span className="font-medium text-gray-700">{k}</span>
                          <span className="font-semibold text-gray-900 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href={telHref}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-red-600 text-white font-bold px-4 py-3 hover:bg-red-700 transition"
                    >
                      Call Emergency Crew
                    </a>
                  </aside>
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-900 text-white overflow-hidden">
                  <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      '24/7 Emergency Response',
                      'Licensed & Insured',
                      'Storm Cleanup',
                      'Crane-Assisted Removal',
                      'Local Volusia Crew',
                    ].map((item, idx) => (
                      <div key={item} className={`px-4 py-3 text-sm font-semibold ${idx > 0 ? 'lg:border-l lg:border-emerald-700' : ''}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">When to Call for Emergency Tree Service</h2>
                <ul className="space-y-2 text-gray-700">
                  {[
                    'A tree has fallen on or near your home',
                    'A large limb is hanging over a roof, driveway, or walkway',
                    'A tree is leaning after heavy wind or rain',
                    'A trunk is cracked, split, or partially uprooted',
                    'Access is blocked by storm debris',
                    'A tree threatens a fence, pool enclosure, dock, seawall, or vehicle',
                    'You need safe cleanup after a storm',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-700 shrink-0" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={telHref}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 text-white font-bold px-5 py-3 hover:bg-red-700 transition"
                >
                  Call 321-282-9795 for emergency help
                </a>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Local Emergency Tree Response</h2>
                <div className="max-w-4xl space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Our emergency crews respond throughout Volusia County, including Port Orange, Daytona Beach, South
                    Daytona, Ormond Beach, New Smyrna Beach, Edgewater, and Ponce Inlet. We regularly handle coastal
                    lots, waterfront properties, and canal-side homes where storm conditions can escalate quickly.
                  </p>
                  <p>
                    Many homeowners monitor severe weather through the{' '}
                    <a
                      href="https://www.weather.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold underline hover:text-emerald-700"
                    >
                      National Weather Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://www.noaa.gov/hurricane-prep"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold underline hover:text-emerald-700"
                    >
                      NOAA hurricane preparedness guidance
                    </a>
                    . For broader planning, we recommend reviewing{' '}
                    <a
                      href="https://www.ready.gov/hurricanes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold underline hover:text-emerald-700"
                    >
                      FEMA hurricane resources
                    </a>{' '}
                    and state updates from the{' '}
                    <a
                      href="https://www.floridadisaster.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold underline hover:text-emerald-700"
                    >
                      Florida Division of Emergency Management
                    </a>
                    .
                  </p>
                  <p>
                    When hazardous limbs or damaged trees threaten structures and access routes, standards from{' '}
                    <a
                      href="https://www.osha.gov/tree-care-industry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold underline hover:text-emerald-700"
                    >
                      OSHA tree care safety guidance
                    </a>{' '}
                    reinforce the need for trained emergency crews and controlled removal methods.
                  </p>
                  <p>
                    For related service details, see{' '}
                    <Link to="/tree-removal" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      tree removal
                    </Link>
                    ,{' '}
                    <Link to="/storm-cleanup" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      storm cleanup
                    </Link>
                    ,{' '}
                    <Link to="/tree-trimming" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      tree trimming
                    </Link>
                    , and{' '}
                    <Link to="/stump-grinding" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      stump grinding
                    </Link>
                    . For immediate help, use the{' '}
                    <Link to="/quote" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      emergency quote form
                    </Link>{' '}
                    or the{' '}
                    <Link to="/contact" className="text-emerald-800 font-semibold underline hover:text-emerald-700">
                      contact page
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Homeowners Choose TREE TEK</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {trustCards.map((item) => (
                    <div key={item} className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-sm font-semibold text-emerald-900">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How Our Emergency Tree Response Works</h2>
                <ol className="grid gap-3 md:grid-cols-2 text-gray-700 list-decimal pl-6">
                  <li>Emergency call or request</li>
                  <li>Dispatch and triage</li>
                  <li>On-site hazard assessment</li>
                  <li>Safe removal plan</li>
                  <li>Controlled removal and cleanup</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Insurance Documentation Support</h2>
                <p className="text-gray-700 leading-relaxed">
                  TREE TEK can provide photos and service details that may help homeowners during insurance claim
                  discussions. Coverage decisions are made by your carrier, so we recommend confirming policy terms
                  directly with your insurer.
                </p>
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">How We Help During Emergencies</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {helpCards.map(([title, desc, Icon]) => (
                  <div key={title} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <Icon className="h-5 w-5 text-emerald-700 mb-2" aria-hidden />
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {emergencyFaqs.map((f) => (
                  <details key={f.q} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto">
              <div className="rounded-2xl bg-red-50 ring-1 ring-red-100 p-6 md:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-950 text-center leading-snug">
                  Need Emergency Tree Service Right Now?
                </h2>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-red-900/90 text-center max-w-3xl mx-auto leading-relaxed">
                  If a tree has fallen, shifted, cracked, or become dangerous after severe weather, TREE TEK is ready
                  to respond with fast emergency tree removal and storm cleanup throughout Volusia County.
                </p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                  <a href={telHref} className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border border-red-300 bg-white text-red-900 font-bold text-[15px] md:text-base px-6 py-3 hover:bg-red-50 transition-colors">
                    <Phone className="w-5 h-5 shrink-0" aria-hidden />
                    Call 321-282-9795
                  </a>
                  <Link to="/quote" className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-emerald-800 text-white font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-700 transition-colors">
                    Request Emergency Service
                  </Link>
                </div>
              </div>
            </div>
          </Section>

          <section className="border-t border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-2 justify-between text-sm">
              <p className="font-semibold text-emerald-900">Emergency. Experts. Local.</p>
              <p className="text-gray-600">TREE TEK — Your Local Emergency Tree Experts</p>
            </div>
          </section>
        </article>
      </>
    );
  }

  if (isPortOrangeTreeRemoval) {
    const featureItems = [
      {
        title: 'Safety First',
        text: 'Risk planning before cutting starts.',
        icon: ShieldCheck,
      },
      {
        title: 'Permit Approved',
        text: 'Guidance aligned with local review.',
        icon: FileCheck2,
      },
      {
        title: 'Property Protection',
        text: 'Focused on structures and landscaping.',
        icon: Landmark,
      },
      {
        title: 'Waterfront Experts',
        text: 'Canal and shoreline lot experience.',
        icon: Waves,
      },
    ];

    const helpCards = [
      ['Permit Guidance', 'Tree removal permit Port Orange guidance and submission prep.'],
      ['Crane-Assisted Removals', 'Controlled picks for tight lots and structure clearance.'],
      ['Waterfront Protection', 'Planning for seawalls, drainage, and shoreline stability.'],
      ['HOA & Access Coordination', 'Notes for gate access, notices, and property logistics.'],
      ['Storm Damage Response', 'Hazard-first stabilization for compromised trees.'],
      ['Safe Lowering Plans', 'Rigging and sectional lowering near homes and utilities.'],
      ['Licensed & Insured', 'Backed by professional coverage and documented scope.'],
      ['Waterfront Specialists', 'Local experience on canal-adjacent properties.'],
      ['Property Protection Focused', 'Driveways, fences, and landscaping safeguarded.'],
      ['Safe Crane Operations', 'Lift sequencing and safety-first ground control.'],
    ];

    return (
      <>
        <SEO
          title={page.metaTitle}
          description={page.metaDescription}
          keywords={keywords}
          path={path}
          image={resolvePublicHeroImage(page.heroImage)}
        />

        <JsonLd data={webLd} />
        {serviceLd ? <JsonLd data={serviceLd} /> : null}
        {faqLd ? <JsonLd data={faqLd} /> : null}

        <article className="bg-emerald-50/40">
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
            <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    PORT ORANGE, FL
                  </p>
                  <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
                    Tree Removal
                    <span className="block font-serif italic text-emerald-100">in Port Orange</span>
                  </h1>
                  <p className="mt-4 text-emerald-50/95 leading-relaxed max-w-xl">
                    Local tree removal planning should balance safety, property protection, and Port Orange tree
                    removal regulations before cutting begins. Tree Tek helps homeowners move from permit questions to
                    compliant, well-coordinated removal.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/quote"
                      className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-7 rounded-lg hover:bg-emerald-50 transition shadow-lg"
                    >
                      Request a Free Quote
                    </Link>
                    <a
                      href={telHref}
                      className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-7 rounded-lg border border-emerald-400/50 transition"
                    >
                      Call 321-282-9795
                    </a>
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-200/30 bg-emerald-900/20">
                    <img
                      src={resolvePublicHeroImage(page.heroImage) || DEFAULT_HERO_IMAGE}
                      alt={page.heroImageAlt ?? `TREE TEK — ${page.h1}`}
                      className="w-full h-[320px] md:h-[420px] object-cover"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute -bottom-7 -left-4 md:left-4 h-24 w-24 md:h-28 md:w-28 rounded-full bg-white text-emerald-900 shadow-xl ring-4 ring-emerald-200/60 flex items-center justify-center text-center px-3">
                    <span className="text-[11px] md:text-xs font-bold leading-tight">Protecting Our Community</span>
                  </div>
                  <div className="mt-8 lg:mt-0 lg:absolute lg:-bottom-12 lg:right-4 w-full lg:max-w-sm rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-100 p-5">
                    <h2 className="text-xl font-bold mb-3">Permit Details</h2>
                    <div className="space-y-2 text-sm">
                      {[
                        ['Jurisdiction', 'City of Port Orange Growth Management'],
                        ['Permit Type', 'Tree Removal Permit'],
                        ['Timeline', '5-10 business days'],
                        ['What We Provide', 'Permit application, site plan, arborist eval'],
                        ['Code Compliance', 'Follows city ordinances'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                          <ClipboardList className="h-4 w-4 mt-0.5 text-emerald-700 shrink-0" aria-hidden />
                          <p>
                            <span className="font-semibold text-gray-900">{k}:</span> <span className="text-gray-700">{v}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 rounded-lg bg-emerald-900 text-emerald-50 px-3 py-2 text-sm font-medium">
                      Our team ensures your project is fully compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-emerald-950 text-white">
            <div className="max-w-6xl mx-auto px-6 py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureItems.map((item) => (
                <div key={item.title} className="rounded-xl border border-emerald-700/70 bg-emerald-900/50 p-4">
                  <item.icon className="h-5 w-5 text-emerald-200 mb-2" aria-hidden />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-emerald-100/90 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8 relative overflow-hidden">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Removals Vary Street by Street</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tree removal laws Port Orange FL property owners navigate can vary by waterfront position, access
                  constraints, and utility exposure. In neighborhoods with canal edges and tighter lots, local review
                  may apply before full removal.
                </p>
                <ul className="space-y-2 text-gray-700">
                  {[
                    'Waterfront and canal lots often need extra planning around shoreline and property boundaries.',
                    'Tight access and screened enclosures can require crane-assisted or sectional lowering.',
                    'Storm history and prior damage influence safe sequencing and cleanup scope.',
                    'Permit considerations may depend on tree condition, location, and site constraints.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-700 shrink-0" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-emerald-50 min-h-[220px] md:min-h-[280px] lg:min-h-[320px]">
                <img
                  src="/images/port-orange-tree-removal-permit-reference.jpeg"
                  alt="Permit and compliance planning context for Port Orange tree removal"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </Section>

          <Section variant="gray">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What Tree Tek Helps With</h2>
              <p className="text-gray-700 mb-6 max-w-3xl">
                From tree removal permit Port Orange prep to field safety execution, our team supports homeowners with
                practical local guidance and protection-first planning.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {helpCards.map(([title, desc]) => (
                  <div key={title} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-700 mb-2" aria-hidden />
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="white">
            <div className="max-w-6xl mx-auto rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Official resources</h2>
              <a
                href="https://www.port-orange.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
              >
                City of Port Orange Official Website
              </a>
            </div>
          </Section>

          <section className="border-t border-gray-200 bg-gray-100">
            <div className="max-w-6xl mx-auto px-5 py-10 md:px-8 md:py-14">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-10 shadow-xl shadow-emerald-950/25 ring-1 ring-emerald-800/60">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center leading-snug">
                  Need Help Navigating Tree Removal Requirements?
                </h2>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-emerald-50/95 text-center max-w-3xl mx-auto leading-relaxed">
                  We understand Port Orange conditions, from waterfront access and utility conflicts to HOA constraints.
                  Tree Tek helps you plan safe removals and clear next steps, including emergency stabilization via{' '}
                  <Link to="/emergency-tree-service-volusia-county" className="underline hover:text-white">
                    emergency tree service in Volusia County
                  </Link>{' '}
                  and post-removal follow-up like{' '}
                  <Link to="/stump-grinding-daytona-beach" className="underline hover:text-white">
                    stump grinding in Daytona Beach
                  </Link>
                  .
                </p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                  <Link
                    to="/quote"
                    className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                  >
                    Request a Free Quote
                  </Link>
                  <a
                    href="tel:3212829795"
                    className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                  >
                    <Phone className="w-5 h-5 shrink-0 opacity-95" aria-hidden />
                    Call 321-282-9795
                  </a>
                </div>
              </div>
            </div>
          </section>
        </article>
      </>
    );
  }

  return (
    <>
      <SEO
        title={page.metaTitle}
        description={page.metaDescription}
        keywords={keywords}
        path={path}
        image={resolvePublicHeroImage(page.heroImage)}
      />

      <JsonLd data={webLd} />
      {serviceLd ? <JsonLd data={serviceLd} /> : null}
      {faqLd ? <JsonLd data={faqLd} /> : null}

      <article className="bg-emerald-50/40">
        <header className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-14">
            <p className="text-emerald-200 text-sm font-medium uppercase tracking-wide mb-2">
              {page.location ? `${page.location} • TREE TEK` : 'TREE TEK • Volusia County'}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">{page.h1}</h1>
            <p className="text-lg text-emerald-100 max-w-3xl leading-relaxed">{page.intro}</p>
            {page.slug === 'tree-removal-daytona-beach' ? (
              <div className="mt-6 w-full rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png"
                  alt="Crane-assisted tree removal at a coastal home in Daytona Beach Florida with tight yard access and nearby waterfront"
                  className="w-full h-[250px] md:h-[400px] object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/quote"
                className="inline-flex items-center justify-center bg-white text-emerald-900 font-bold py-3 px-8 rounded-lg hover:bg-emerald-50 transition shadow-lg"
              >
                {ctaText || page.ctaText}
              </Link>
              <a
                href={telHref}
                className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg border border-emerald-500/40 transition"
              >
                Call {phone}
              </a>
            </div>
          </div>
        </header>

        {page.slug === 'tree-removal-daytona-beach' ? (
          <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
            <div className="rounded-2xl bg-white shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950 mb-6">
                Why Daytona Beach Tree Removal Needs Special Planning
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: '🌊',
                    title: 'Coastal Wind Exposure',
                    text: 'Oceanfront winds can stress weak limbs and make removals more sensitive near homes, roofs, and walkways.',
                  },
                  {
                    icon: '🏡',
                    title: 'Tight Side Yards',
                    text: 'Many Daytona Beach properties have narrow access points, pavers, pools, fences, and landscaping that need protection.',
                  },
                  {
                    icon: '🏗️',
                    title: 'Crane or Sectional Removal',
                    text: 'TREE TEK chooses the safest method for each job: crane-assisted lifting when space is tight, or sectional lowering when access allows.',
                  },
                  {
                    icon: '🧹',
                    title: 'Cleanup Included',
                    text: 'After removal, debris is cleared and the property is left clean, safe, and ready to use.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-2xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-slate-950 mb-2">{item.title}</h3>
                    <p className="text-slate-700 leading-relaxed text-sm md:text-base">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : page.heroImage && !isPortOrangeTreeRemoval ? (
          <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
            <div className={getHeroFrameClasses(page.slug)}>
              <img
                src={resolvePublicHeroImage(page.heroImage) || DEFAULT_HERO_IMAGE}
                alt={page.heroImageAlt ?? `TREE TEK — ${page.h1}`}
                className={
                  page.slug === 'crane-tree-work' || page.slug === 'stump-grinding-port-orange' || page.slug === 'tree-removal'
                    ? 'w-full h-auto object-contain rounded-xl mx-auto'
                    : `w-full h-full object-cover ${getHeroImageObjectPositionClasses(page)} ${
                        page.slug === PERMIT_PAGE_SLUG ? 'saturate-90' : ''
                      }`
                }
                style={page.heroImagePosition ? { objectPosition: page.heroImagePosition } : undefined}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_HERO_IMAGE;
                }}
              />
              {page.slug === PERMIT_PAGE_SLUG ? (
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/25 to-transparent"
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {page.slug === PORT_ORANGE_TREE_REMOVAL_SLUG ? (
          <Section variant="white">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Removals Vary Street by Street</h2>
                <p className="text-gray-700 leading-relaxed">
                  In Port Orange, tree removal scope can change quickly between interior neighborhoods and canal-side
                  parcels. For homeowners planning{' '}
                  <Link to="/tree-removal-port-orange" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    tree removal in Port Orange
                  </Link>
                  , local access and compliance details often affect both permit timing and removal method.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: 'Waterfront + canal lots',
                      text: 'Shoreline setbacks, drainage patterns, and seawall protection may require extra planning.',
                      icon: Waves,
                    },
                    {
                      title: 'Tight access + screened enclosures',
                      text: 'Narrow side yards and pool enclosures often shift crews toward controlled lowering instead of open drops.',
                      icon: TrafficCone,
                    },
                    {
                      title: 'Storm history matters',
                      text: 'Older storm stress and partial crown cracking can change removal sequencing and safety controls.',
                      icon: Wind,
                    },
                    {
                      title: 'Cleanup standards',
                      text: 'Brush, log sections, and final site cleanup are planned up front to protect nearby structures and yards.',
                      icon: FileCheck2,
                    },
                    {
                      title: 'Licensed & insured tree service',
                      text: 'Work scope and protection planning are backed by licensed and insured operations for local projects.',
                      icon: ShieldCheck,
                    },
                    {
                      title: 'Permit considerations',
                      text: 'Port Orange tree removal regulations may require local review depending on tree condition and property context.',
                      icon: ShieldCheck,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                          <item.icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-emerald-200 bg-white p-6 md:p-7 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Permit Details</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Tree removal permit Port Orange requirements typically depend on site conditions, tree type, and
                    local review. This quick reference is for planning only; official city review controls final
                    approvals.
                  </p>
                  <div className="space-y-3">
                    {[
                      ['Jurisdiction', 'City of Port Orange review channels may include planning, zoning, and permit intake workflows.'],
                      ['Permit type', 'Applications may vary by property type, tree condition, and whether waterfront or right-of-way constraints apply.'],
                      ['Typical review timeline', 'Timing typically depends on application completeness, inspections, and any supplemental documentation.'],
                      ['What Tree Tek helps provide', 'Scope notes, site-access context, and practical removal planning details for homeowner submissions.'],
                      ['Compliance note', 'Tree removal laws Port Orange FL and Port Orange tree removal regulations may change; local review may apply before cutting.'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{label}</p>
                        <p className="mt-1 text-sm text-gray-700 leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What Tree Tek Helps With</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2"><FileCheck2 className="h-4 w-4 mt-0.5 text-emerald-700" aria-hidden />Permit guidance and submission prep support</li>
                      <li className="flex items-start gap-2"><Landmark className="h-4 w-4 mt-0.5 text-emerald-700" aria-hidden />HOA and property access coordination details</li>
                      <li className="flex items-start gap-2"><Waves className="h-4 w-4 mt-0.5 text-emerald-700" aria-hidden />Waterfront and canal-side property protection plans</li>
                      <li className="flex items-start gap-2"><LifeBuoy className="h-4 w-4 mt-0.5 text-emerald-700" aria-hidden />Storm-damaged tree evaluation and risk triage</li>
                      <li className="flex items-start gap-2"><TrafficCone className="h-4 w-4 mt-0.5 text-emerald-700" aria-hidden />Crane-assisted and controlled lowering plans</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Licensed & Insured',
                      'Waterfront Experience',
                      'Permit Guidance',
                      'Property Protection Focused',
                      'Safe Crane Operations',
                    ].map((badge) => (
                      <div key={badge} className="rounded-xl border border-emerald-100 bg-white px-3 py-3 text-center text-xs font-semibold text-emerald-900 shadow-sm">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Official Resources</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Verify current city requirements before finalizing removal schedules.
                </p>
                <a
                  href="https://www.port-orange.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                >
                  City of Port Orange Official Website
                </a>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-8 shadow-xl shadow-emerald-950/25 ring-1 ring-emerald-800/60">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Need Help Navigating Tree Removal Requirements?
                </h2>
                <p className="mt-3 text-emerald-50/95 text-center max-w-3xl mx-auto leading-relaxed">
                  Tree Tek brings local Port Orange experience, from waterfront access challenges to permit workflow
                  expectations. We help homeowners understand next steps, protect structures and landscaping, and plan
                  safe removals with clear guidance through the process. For urgent hazards, start with{' '}
                  <Link to="/emergency-tree-service-volusia-county" className="underline hover:text-white">
                    emergency tree service in Volusia County
                  </Link>
                  . After removal, many properties also benefit from follow-up{' '}
                  <Link to="/stump-grinding-daytona-beach" className="underline hover:text-white">
                    stump grinding in Daytona Beach
                  </Link>
                  .
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                  <Link
                    to="/quote"
                    className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                  >
                    Request a Free Quote
                  </Link>
                  <a
                    href="tel:3212829795"
                    className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                  >
                    Call 321-282-9795
                  </a>
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        {(isPortOrangeTreeRemoval ? [] : page.sections).map((section) => (
          <Section key={section.heading} variant="white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{section.heading}</h2>
              <div className="space-y-4">
                {section.paragraphs.map((para, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </Section>
        ))}

        {page.slug === PERMIT_PAGE_SLUG ? (
          <>
            <Section variant="white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Before You Remove a Tree</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Permit questions are local and situational. If you are comparing options for{' '}
                  <Link to="/tree-removal-port-orange" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    tree removal in Port Orange
                  </Link>{' '}
                  or{' '}
                  <Link to="/tree-removal-daytona-beach" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    tree removal in Daytona Beach
                  </Link>
                  , start by confirming what your local office requires before scheduling work.
                </p>
                <ul className="space-y-2 text-gray-700 list-disc pl-6">
                  <li>Check city and county rules.</li>
                  <li>Confirm if the tree is protected.</li>
                  <li>Review HOA requirements.</li>
                  <li>Look for coastal, wetland, or dune protections.</li>
                  <li>Document storm damage before removal.</li>
                  <li>Call a professional before cutting near structures, utilities, or property lines.</li>
                </ul>
              </div>
            </Section>

            <Section variant="gray">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Tree Removal Rules Change by City</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tree ordinances can differ across Daytona Beach, Port Orange, South Daytona, and broader Volusia County
                  service areas. The same species or trunk diameter may be handled differently depending on local code
                  updates, protected-zone overlays, and neighborhood requirements.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If the tree is storm-damaged, review{' '}
                  <Link to="/emergency-tree-service-volusia-county" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    emergency tree service in Volusia County
                  </Link>{' '}
                  options first. If your scope includes canopy correction or cleanup after approval, see{' '}
                  <Link to="/tree-trimming-daytona-beach" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    tree trimming in Daytona Beach
                  </Link>{' '}
                  and{' '}
                  <Link to="/stump-grinding-daytona-beach" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    stump grinding in Daytona Beach
                  </Link>
                  .
                </p>
              </div>
            </Section>

            <Section variant="white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Official resources</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For current permitting and ordinance language, always verify with official agencies directly:
                </p>
                <ul className="space-y-2 text-gray-700 list-disc pl-6">
                  <li>
                    <a
                      href="https://www.fdacs.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      Florida Department of Agriculture and Consumer Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.volusia.org/services/growth-and-resource-management/environmental-management/permitting/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      Volusia County environmental permitting resources
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.daytonabeach.gov/1140"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      City of Daytona Beach permit and licensing portal
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ci-portorange-fl.smartgovcommunity.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      City of Port Orange permitting portal
                    </a>
                  </li>
                </ul>
              </div>
            </Section>

            <Section variant="white">
              <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-8 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-800/50">
                  <p className="text-base md:text-lg text-emerald-50 leading-relaxed text-center max-w-3xl mx-auto">
                    Not sure if your tree needs approval? Tree Tek can inspect the site, explain the safest removal
                    approach, and help you understand the next step before work begins.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                    <Link
                      to="/quote"
                      className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                    >
                      Request a Free Quote
                    </Link>
                    <a
                      href="tel:3212829795"
                      className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                    >
                      Call 321-282-9795
                    </a>
                  </div>
                  <p className="mt-4 text-center text-emerald-100/90 text-sm">
                    Need permit-specific questions answered first?{' '}
                    <Link to="/contact" className="underline hover:text-white">
                      Contact Tree Tek
                    </Link>{' '}
                    or{' '}
                    <Link to="/quote" className="underline hover:text-white">
                      request a free quote
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </Section>
          </>
        ) : null}

        {page.slug === PORT_ORANGE_TREE_REMOVAL_SLUG ? (
          <>
            <Section variant="white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Tree Removal Permits in Port Orange, FL (Port Orange tree removal permit)
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are planning{' '}
                  <Link to="/tree-removal-port-orange" className="text-emerald-800 font-semibold hover:text-emerald-700 underline">
                    tree removal in Port Orange
                  </Link>
                  , tree removal permit Port Orange requirements may depend on the tree&apos;s diameter at breast height
                  (DBH), protected species status, property location (including front yard placement, waterfront
                  conditions, easements, or right-of-way constraints), and whether the property is residential or
                  commercial.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In practice, tree removal laws Port Orange FL property owners deal with are typically enforced through
                  city planning, zoning, and environmental review channels. Port Orange tree removal regulations may
                  allow exemptions for dead, hazardous, or storm-damaged trees, but documentation like photos and, in
                  some cases, an arborist assessment may still be requested during review.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  In Port Orange, waterfront and canal-adjacent properties often require extra consideration due to
                  shoreline stability, drainage, and property boundary constraints.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Once approval is confirmed, safe removal planning becomes the next step - especially for tight lots,
                  waterfront homes, or trees near structures.
                </p>
              </div>
            </Section>

            <Section variant="gray">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  How to Get a Tree Removal Permit in Port Orange (do you need a permit Port Orange)
                </h2>
                <ol className="space-y-3 text-gray-700 list-decimal pl-6">
                  <li>Contact the City of Port Orange to confirm current tree permit expectations for your address.</li>
                  <li>Submit a permit application online or through the city&apos;s available intake process.</li>
                  <li>
                    Provide key tree details: size, species, condition, and exact location on the property.
                  </li>
                  <li>Wait for city review and any required field inspection.</li>
                  <li>Receive approval before removal work begins.</li>
                </ol>
              </div>
            </Section>

            <Section variant="white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">When You May NOT Need a Permit</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Exemptions may apply based on tree condition and immediate safety concerns, but local confirmation is
                  always recommended before cutting.
                </p>
                <ul className="space-y-2 text-gray-700 list-disc pl-6">
                  <li>Dead or hazardous trees, with supporting proof such as photos or professional notes.</li>
                  <li>Storm-damaged trees where removal is tied to documented damage.</li>
                  <li>Immediate safety risks affecting structures, utilities, access, or neighboring property.</li>
                  <li>
                    Smaller trees below certain diameter thresholds that may be exempt under current local standards.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  For urgent situations, start with{' '}
                  <Link
                    to="/emergency-tree-service-volusia-county"
                    className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                  >
                    emergency tree service in Volusia County
                  </Link>{' '}
                  to stabilize hazards, then plan cleanup and follow-up work such as{' '}
                  <Link
                    to="/stump-grinding-daytona-beach"
                    className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                  >
                    stump grinding in Daytona Beach
                  </Link>{' '}
                  when appropriate for your property goals.
                </p>
              </div>
            </Section>

            <Section variant="white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Official Resources</h2>
                <ul className="space-y-2 text-gray-700 list-disc pl-6">
                  <li>
                    <a
                      href="https://www.port-orange.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      City of Port Orange Official Website
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.port-orange.org/DocumentCenter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      City of Port Orange Document Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ci-portorange-fl.smartgovcommunity.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-semibold hover:text-emerald-700 underline"
                    >
                      Port Orange Permitting Portal
                    </a>
                  </li>
                </ul>
              </div>
            </Section>

            <Section variant="white">
              <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-8 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-800/50">
                  <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                    Need Help With Permits or Tree Removal?
                  </h2>
                  <p className="mt-4 text-base md:text-lg text-emerald-50 leading-relaxed text-center max-w-3xl mx-auto">
                    Tree Tek helps homeowners evaluate whether a permit may be needed, identify hazardous trees, and
                    plan safe removals that match local requirements and site conditions. Our crew works in Port Orange
                    neighborhoods every week, including tighter canal-side and waterfront lots, so we can guide you
                    through practical next steps before cutting begins, whether you are planning{' '}
                    <Link to="/tree-removal-port-orange" className="underline hover:text-white">
                      tree removal in Port Orange
                    </Link>{' '}
                    or need rapid hazard stabilization with{' '}
                    <Link to="/emergency-tree-service-volusia-county" className="underline hover:text-white">
                      emergency tree service in Volusia County
                    </Link>
                    .
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                    <Link
                      to="/quote"
                      className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                    >
                      Request a Free Quote
                    </Link>
                    <a
                      href="tel:3212829795"
                      className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                    >
                      Call 321-282-9795
                    </a>
                  </div>
                </div>
              </div>
            </Section>
          </>
        ) : null}

        <Section variant="gray">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {page.faqs.map((f) => (
                <div key={f.question} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related services & guides</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-gray-700">
              {designatedRelated.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/${r.slug}`}
                    className="block rounded-lg border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-3 transition"
                  >
                    <span className="font-semibold text-emerald-800">{r.h1}</span>
                    <span className="block text-sm text-gray-500 mt-0.5 line-clamp-2">{r.metaDescription.slice(0, 110)}…</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <section className="border-t border-gray-200 bg-gray-100">
          <div className="max-w-4xl mx-auto px-5 py-10 md:px-8 md:py-16">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-10 shadow-xl shadow-emerald-950/25 ring-1 ring-emerald-800/60">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center leading-snug">
                Ready for safe, professional tree service?
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-emerald-50/95 text-center max-w-2xl mx-auto leading-relaxed">
                Request a free quote or call TREE TEK for fast service across Volusia County.
              </p>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                <Link
                  to="/quote"
                  className="inline-flex justify-center items-center min-h-[48px] rounded-xl bg-white text-emerald-950 font-bold text-[15px] md:text-base px-6 py-3 shadow-md hover:bg-emerald-50 transition-colors"
                >
                  {ctaText}
                </Link>
                <a
                  href={telHref}
                  className="inline-flex justify-center items-center gap-2 min-h-[48px] rounded-xl border-2 border-white/90 bg-emerald-800/40 text-white font-bold text-[15px] md:text-base px-6 py-3 hover:bg-emerald-800/70 transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0 opacity-95" aria-hidden />
                  Call {phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

export default function SeoLandingPage({ slug }: Props) {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';
  const telHref = `tel:${phoneToTel(phone)}`;

  const [cmsRow, setCmsRow] = useState<CmsSitePageRow | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setCmsRow(undefined);
    (async () => {
      try {
        const row = await sitePagesApi.getPublishedBySlug(slug);
        if (!alive) return;
        setCmsRow(row ? (row as CmsSitePageRow) : null);
      } catch {
        if (alive) setCmsRow(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (cmsRow === undefined) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-600">
        <div className="h-10 w-10 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading page…</p>
      </div>
    );
  }

  if (cmsRow) {
    return <CmsSiteArticle row={cmsRow} ctaText={ctaText} phone={phone} telHref={telHref} />;
  }

  const page = getSeoPageBySlug(slug);
  if (!page) {
    return <NotFound />;
  }

  return <StaticSeoArticle page={page} ctaText={ctaText} phone={phone} telHref={telHref} />;
}
