import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';
import { isLikelyValidImageUrl, plainTextFromMarkdown } from '../../lib/blogUtils';
import { blogApi } from '../../services/api';

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  location?: string | null;
  image_url?: string | null;
}

function CardImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!isLikelyValidImageUrl(src) || failed) return null;
  return (
    <div className="aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-gray-100 border-b border-gray-100">
      <img
        src={src}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function listPreview(post: BlogPostSummary): string {
  if (post.excerpt?.trim()) return post.excerpt.trim();
  const fromMd = post.content ? plainTextFromMarkdown(post.content) : '';
  if (fromMd.length <= 200) return fromMd || 'Read the full article for expert tree care tips.';
  return `${fromMd.slice(0, 197).trim()}…`;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const result = await blogApi.getPosts();
        setPosts(result || []);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Unable to load blog posts right now.');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return (
      <>
        <SEO title="Blog — TREE TEK Tree Care Tips & News" description="Articles and updates from TREE TEK on tree care, safety, and Volusia County projects." path="/blog" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-28 md:pt-32 pb-16 text-gray-500">Loading posts…</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO title="Blog — TREE TEK" description="TREE TEK blog — tree care tips and company news." path="/blog" />
        <div className="max-w-6xl mx-auto px-5 pt-28 pb-16 text-red-700">{error}</div>
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-28 md:pt-32 pb-16 md:pb-14 bg-[#f7f8f7] min-h-[50vh]">
      <SEO
        title="Blog — TREE TEK Tree Care Tips & News"
        description="Tips on tree removal, pruning, storm prep, and local tree care from TREE TEK in Volusia County, Florida."
        path="/blog"
      />

      <header className="mb-10 sm:mb-12 text-center max-w-2xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-3">Tree care knowledge</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">Blog</h1>
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">
          Practical guides for homeowners in Volusia County and surrounding areas.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-300"
          >
            {post.image_url ? (
              <Link to={`/blog/${post.slug}`} className="block shrink-0">
                <CardImage src={post.image_url} title={post.title} />
              </Link>
            ) : (
              <div className="aspect-[16/10] w-full bg-gradient-to-br from-emerald-100/80 to-gray-50 border-b border-gray-100" />
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              {post.location?.trim() ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-2">{post.location.trim()}</p>
              ) : null}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-950 leading-snug group-hover:text-emerald-900 transition-colors">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed flex-1 text-[15px] sm:text-base">{listPreview(post)}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                Read more
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
