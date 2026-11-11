import { useEffect, useState } from 'react';
import { SEO_PAGE_SLUGS } from '../data/seoPages';
import { sitePagesApi } from '../services/api';

export type PublicCmsPage = {
  slug: string;
  title: string;
  h1: string | null;
};

const staticSlugs = new Set(SEO_PAGE_SLUGS);

/** Published admin pages that do not already have a built-in menu link. */
export function useExtraPublishedPages(): PublicCmsPage[] {
  const [pages, setPages] = useState<PublicCmsPage[]>([]);

  useEffect(() => {
    let alive = true;
    sitePagesApi
      .getPublishedSummaries()
      .then((rows: PublicCmsPage[]) => {
        if (!alive) return;
        setPages((rows || []).filter((row) => row?.slug && !staticSlugs.has(row.slug)));
      })
      .catch(() => {
        if (alive) setPages([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return pages;
}

export function publicPageLabel(page: PublicCmsPage): string {
  const fromTitle = (page.title || '').split('|')[0].trim();
  return fromTitle || (page.h1 || page.slug).trim();
}
