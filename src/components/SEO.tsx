import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from '../lib/siteUrl';

export type SEOProps = {
  title: string;
  description: string;
  keywords?: string;
  /** Absolute image URL or site-relative path (e.g. /treetek-logo.png) */
  image?: string;
  /** Path only, e.g. /services */
  path: string;
  noindex?: boolean;
};

function resolveOgImage(image?: string): string {
  if (!image) return absoluteUrl('/treetek-logo.png');
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image.startsWith('/') ? image : `/${image}`);
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  path,
  noindex,
}: SEOProps) {
  const canonicalPath = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = resolveOgImage(image);
  const pageTitle = title.includes('TREE TEK') ? title : `${title} | TREE TEK`;

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonical} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TREE TEK" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
