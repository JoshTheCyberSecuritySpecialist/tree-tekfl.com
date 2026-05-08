import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Phone } from 'lucide-react';
import BlogMarkdown from '../../components/BlogMarkdown';
import SEO from '../../components/SEO';
import { isLikelyValidImageUrl, plainTextFromMarkdown } from '../../lib/blogUtils';
import { absoluteUrl } from '../../lib/siteUrl';
import { supabase } from '../../lib/supabase';
import { phoneToTel, usePublicWorkspaceSettings } from '../../lib/workspaceSettings';

function excerptFromContent(content: string, max = 165): string {
  const plain = plainTextFromMarkdown(content);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

/** Split markdown roughly halfway for mid-article CTA insertion. */
function splitContentAtMidpoint(markdown: string): [string, string] {
  const trimmed = markdown.trim();
  if (!trimmed) return ['', ''];
  const blocks = trimmed.split(/\n\n+/).filter(Boolean);
  if (blocks.length <= 1) {
    const mid = Math.floor(trimmed.length / 2);
    const sliceAt = trimmed.lastIndexOf('\n', mid);
    const idx = sliceAt > trimmed.length * 0.15 ? sliceAt : mid;
    const a = trimmed.slice(0, idx).trim();
    const b = trimmed.slice(idx).trim();
    return [a, b];
  }
  const midIdx = Math.ceil(blocks.length / 2);
  return [blocks.slice(0, midIdx).join('\n\n'), blocks.slice(midIdx).join('\n\n')];
}

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  location?: string | null;
  image_url?: string | null;
  created_at?: string;
}

function HeroImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!isLikelyValidImageUrl(src) || failed) return null;
  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 shadow-lg bg-gray-100">
      <img
        src={src}
        alt={title}
        className="w-full max-h-[min(420px,52vh)] object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ArticleCtaCard({ ctaText, phone, telHref }: { ctaText: string; phone: string; telHref: string }) {
  return (
    <aside className="my-14 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-md">
      <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        Need safe tree removal in Volusia County?
      </p>
      <p className="text-gray-600 mb-6 text-[17px] leading-relaxed">
        Licensed &amp; insured — free estimates for residential and commercial tree work.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Link
          to="/quote"
          className="inline-flex justify-center items-center rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3.5 shadow-md transition-colors text-center"
        >
          {ctaText}
        </Link>
        <a
          href={telHref}
          className="inline-flex justify-center items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-900 hover:border-emerald-300 transition-colors"
        >
          <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
          Call {phone}
        </a>
      </div>
    </aside>
  );
}

function ProTipCallout() {
  return (
    <aside className="my-10 rounded-xl border border-amber-200/80 bg-amber-50/90 px-6 py-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900/80 mb-2">Pro tip</p>
      <p className="text-gray-800 text-[17px] leading-relaxed">
        Always hire a <strong className="text-gray-950">licensed, insured</strong> tree company for work near your home or power lines.
        Ask for proof of insurance before any cutting begins.
      </p>
    </aside>
  );
}

export default function BlogPost() {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';
  const telHref = `tel:${phoneToTel(phone)}`;

  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      if (!slug) {
        setError('Invalid blog post.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        console.log('BLOG SLUG:', slug);
        console.log('BLOG DATA:', data);
        console.log('BLOG ERROR:', error);

        if (error) {
          setError(error.message || 'Unable to load this blog post right now.');
          setPost(null);
          return;
        }

        setPost(data || null);
      } catch (err) {
        console.error('Error loading blog post:', err);
        const msg = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : '';
        setError(msg || 'Unable to load this blog post right now.');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  const description = useMemo(() => {
    if (!post) return '';
    if (post.excerpt?.trim()) return post.excerpt.trim();
    return excerptFromContent(post.content || '') || post.title;
  }, [post]);

  const [beforeCta, afterCta] = useMemo(() => {
    if (!post?.content) return ['', ''];
    return splitContentAtMidpoint(post.content);
  }, [post?.content]);

  const showMidCta = Boolean(beforeCta && afterCta && afterCta.length > 80);

  if (loading) {
    return (
      <>
        <SEO
          title="Loading — TREE TEK Blog"
          description="TREE TEK blog article."
          path={`/blog/${slug ?? ''}`}
        />
        <div className="max-w-[900px] mx-auto px-5 sm:px-6 pt-28 md:pt-32 pb-16 text-gray-500">Loading blog post...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO title="Blog post — TREE TEK" description="TREE TEK blog article." path={`/blog/${slug ?? ''}`} />
        <div className="max-w-[900px] mx-auto px-5 pt-28 pb-16 text-red-700">{error}</div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Blog post — TREE TEK" description="TREE TEK blog article." path={`/blog/${slug ?? ''}`} />
        <div className="max-w-[900px] mx-auto px-5 pt-28 pb-16 text-gray-700">Blog post not found.</div>
      </>
    );
  }

  const ogImage =
    post.image_url &&
    isLikelyValidImageUrl(post.image_url) &&
    (post.image_url.startsWith('http')
      ? post.image_url
      : absoluteUrl(post.image_url.startsWith('/') ? post.image_url : `/${post.image_url}`));

  const dateLine =
    post.created_at &&
    new Date(post.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <article className="max-w-[900px] mx-auto px-5 sm:px-6 pt-28 md:pt-32 pb-16 md:pb-14 bg-[#f7f8f7] min-h-[60vh]">
      <SEO
        title={`${post.title} — TREE TEK Blog`}
        description={description || post.title}
        image={ogImage || undefined}
        path={`/blog/${post.slug}`}
      />

      <div className="bg-white rounded-2xl shadow-[0_4px_40px_-12px_rgba(0,0,0,0.12)] border border-gray-100/90 px-6 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-14">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider px-3 py-1 mb-5">
            Tree Service Guide
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.35rem] font-bold text-gray-950 tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            {[post.location?.trim(), dateLine].filter(Boolean).join(' · ')}
          </p>
        </div>

        {post.image_url ? <HeroImage src={post.image_url} title={post.title} /> : null}

        <ProTipCallout />

        {showMidCta ? (
          <>
            <BlogMarkdown variant="article">{beforeCta}</BlogMarkdown>
            <ArticleCtaCard ctaText={ctaText} phone={phone} telHref={telHref} />
            <BlogMarkdown variant="article">{afterCta}</BlogMarkdown>
          </>
        ) : (
          <>
            <BlogMarkdown variant="article">{post.content || ''}</BlogMarkdown>
            <div className="mt-14 pt-10 border-t border-gray-100">
              <ArticleCtaCard ctaText={ctaText} phone={phone} telHref={telHref} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}
