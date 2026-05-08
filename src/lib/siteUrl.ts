/** Production site origin for canonical URLs, OG URLs, and JSON-LD. Override with VITE_SITE_URL. */
export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined;
  if (raw && /^https?:\/\//i.test(raw.trim())) {
    return raw.trim().replace(/\/+$/, '');
  }
  return 'https://treetekfl.com';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === '/') return `${base}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
