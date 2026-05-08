export type SeoIntent = 'commercial' | 'informational' | 'local-service';

export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoPage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent: SeoIntent;
  /** Main service line for schema & related linking, e.g. "Tree removal" */
  service: string | null;
  /** Human location label or null for non-local pages */
  location: string | null;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  ctaText: string;
  /** Optional hero image path under /public */
  heroImage?: string;
  /** Optional alt text for hero image (defaults to “TREE TEK — {h1}”) */
  heroImageAlt?: string;
  /** Optional CSS object-position for hero image (defaults to center). */
  heroImagePosition?: string;
};
