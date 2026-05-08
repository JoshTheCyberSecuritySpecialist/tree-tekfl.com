import { useMemo, useRef, useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase, GalleryImage } from '../lib/supabase';
import { phoneToTel, usePublicWorkspaceSettings } from '../lib/workspaceSettings';
type MediaType = 'image' | 'video';
type GalleryItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  caption: string;
  url: string;
  alt: string;
  type: MediaType;
  is_published?: boolean;
  is_featured?: boolean;
  display_order?: number;
  before_url?: string | null;
  after_url?: string | null;
  video_url?: string | null;
  created_at: string;
};

type BeforeAfterItem = {
  id: string;
  title: string;
  location: string;
  caption: string;
  beforeUrl: string;
  afterUrl: string;
  beforeAlt: string;
  afterAlt: string;
};

const localFallbackItems: GalleryItem[] = [
  {
    id: 'local-1',
    title: 'Coastal Home Tree Removal',
    category: 'Tree Removal',
    location: 'Daytona Beach',
    caption: 'Crane-assisted removal near waterfront property with tight access.',
    url: '/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png',
    alt: 'Crane-assisted tree removal at a coastal home in Daytona Beach, Florida.',
    type: 'image',
    is_published: true,
    is_featured: true,
    display_order: 1,
    before_url: '/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png',
    after_url: '/images/crane-tree-removal-poolside-backyard-tree-tek-volusia-county-florida.png',
    created_at: new Date().toISOString(),
  },
  {
    id: 'local-2',
    title: 'Poolside Crane Lift',
    category: 'Crane Work',
    location: 'Volusia County',
    caption: 'Precision crane picks protect pavers, fencing, and pool decks.',
    url: '/images/crane-tree-removal-poolside-backyard-tree-tek-volusia-county-florida.png',
    alt: 'Crane tree removal near a pool in a residential backyard.',
    type: 'image',
    is_published: true,
    is_featured: true,
    display_order: 2,
    before_url: '/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png',
    after_url: '/images/crane-tree-removal-poolside-backyard-tree-tek-volusia-county-florida.png',
    created_at: new Date().toISOString(),
  },
];

const filters = ['All', 'Tree Removal', 'Crane Work', 'Stump Grinding', 'Storm Cleanup'] as const;

function normalizeType(url: string, explicitType?: string): MediaType {
  if (explicitType === 'video') return 'video';
  return /\.(mp4|webm|mov)$/i.test(url) ? 'video' : 'image';
}

function PlaceholderCard() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-700 text-white flex flex-col items-center justify-center p-6 text-center">
      <img src="/treetek-logo.png" alt="" className="h-12 w-auto opacity-90 mb-4" loading="lazy" decoding="async" />
      <p className="font-semibold">TREE TEK</p>
      <p className="text-sm text-gray-200 mt-2">Project Image Coming Soon</p>
    </div>
  );
}

function BeforeAfterSlider({ item }: { item: BeforeAfterItem }) {
  const [position, setPosition] = useState(52);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  const setFromClientX = (clientX: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    const pct = ((clientX - box.left) / box.width) * 100;
    setPosition(Math.max(5, Math.min(95, pct)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-lg overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-64 sm:h-72 md:h-80 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {afterError ? (
          <PlaceholderCard />
        ) : (
          <img
            src={item.afterUrl}
            alt={item.afterAlt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => {
              if (import.meta.env.DEV) console.log('Missing gallery image path:', item.afterUrl);
              setAfterError(true);
            }}
          />
        )}

        {!beforeError && (
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
            <img
              src={item.beforeUrl}
              alt={item.beforeAlt}
              className="h-full w-[1200px] max-w-none object-cover"
              loading="lazy"
              decoding="async"
              onError={() => {
                if (import.meta.env.DEV) console.log('Missing gallery image path:', item.beforeUrl);
                setBeforeError(true);
              }}
            />
          </div>
        )}

        <div
          className="absolute inset-y-0"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="h-full w-0.5 bg-white/90 shadow" />
          <button
            type="button"
            aria-label="Adjust before and after slider"
            className="absolute top-1/2 -translate-y-1/2 -left-4 h-8 w-8 rounded-full bg-white text-gray-900 shadow-md text-xs font-bold"
          >
            <>
              <span className="sr-only">Drag</span>
              ||
            </>
          </button>
        </div>

        <span className="absolute top-3 left-3 rounded bg-black/60 text-white text-[10px] font-semibold px-2 py-1">BEFORE</span>
        <span className="absolute top-3 right-3 rounded bg-black/60 text-white text-[10px] font-semibold px-2 py-1">AFTER</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        <p className="text-sm text-emerald-700 font-medium">{item.location}</p>
        <p className="text-sm text-gray-600 mt-1">{item.caption}</p>
      </div>
    </div>
  );
}

export default function PastWork() {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';
  const telHref = `tel:${phoneToTel(phone)}`;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [showCount, setShowCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const featuredRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  async function fetchGalleryItems() {
    try {
      if (!supabase) {
        setItems(localFallbackItems);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: GalleryItem[] = (data as GalleryImage[]).map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category || 'Tree Service',
          location: row.location || 'Volusia County',
          caption: row.caption || 'Professional tree service by TREE TEK.',
          url: row.video_url || row.url,
          alt: row.alt || row.title,
          type: normalizeType(row.video_url || row.url, row.media_type),
          is_published: row.is_published !== false,
          is_featured: Boolean(row.is_featured),
          display_order: row.display_order ?? 0,
          before_url: row.before_url ?? null,
          after_url: row.after_url ?? null,
          video_url: row.video_url ?? null,
          created_at: row.created_at,
        }));
        setItems(mapped.filter((item) => item.is_published !== false));
      } else {
        setItems(localFallbackItems);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setItems(localFallbackItems);
    } finally {
      setLoading(false);
    }
  }

  const featuredItems = useMemo(() => {
    const featured = items.filter((item) => item.is_featured && item.is_published !== false);
    return (featured.length > 0 ? featured : items).slice(0, 6);
  }, [items]);
  const validBeforeAfterItems = useMemo<BeforeAfterItem[]>(() => {
    const pairs = items
      .filter((item) => item.is_published !== false && item.before_url && item.after_url)
      .slice(0, 6)
      .map((item) => ({
        id: `ba-${item.id}`,
        title: item.title,
        location: item.location,
        caption: item.caption,
        beforeUrl: item.before_url as string,
        afterUrl: item.after_url as string,
        beforeAlt: `Before — ${item.alt}`,
        afterAlt: `After — ${item.alt}`,
      }));
    if (pairs.length > 0) return pairs;
    return [];
  }, [items]);
  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return items;
    return items.filter((item) => item.category.toLowerCase().includes(activeFilter.toLowerCase()));
  }, [items, activeFilter]);
  const visibleItems = useMemo(() => filteredItems.slice(0, showCount), [filteredItems, showCount]);

  useEffect(() => {
    setShowCount(6);
  }, [activeFilter]);

  const canShowMore = showCount < filteredItems.length;

  const scrollFeatured = (dir: 'left' | 'right') => {
    const el = featuredRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.86);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#f6f7f6] min-h-screen pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <SEO
        title="Past Work — Tree Removal & Stump Grinding Photos | TREE TEK"
        description="Photos of tree removals, crane work, storm cleanup, and stump grinding projects across Volusia County and Central Florida by TREE TEK."
        keywords="tree service photos, Port Orange tree removal, Daytona crane tree work, TREE TEK gallery"
        path="/past-work"
      />

      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Our Past Work</h1>
          <p className="mt-3 text-emerald-50/95 max-w-3xl text-sm md:text-lg">
            Real TREE TEK jobs across Daytona Beach, Port Orange, and Volusia County.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/quote" className="inline-flex items-center justify-center rounded-xl bg-white text-emerald-950 font-semibold px-6 py-3 hover:bg-emerald-50 transition">
              {ctaText}
            </Link>
            <a href={telHref} className="inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition">
              Call Now
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-950">Featured Work</h2>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scrollFeatured('left')} className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-emerald-700 transition" aria-label="Scroll featured work left">
              <ArrowLeft className="w-5 h-5 mx-auto" />
            </button>
            <button onClick={() => scrollFeatured('right')} className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-emerald-700 transition" aria-label="Scroll featured work right">
              <ArrowRight className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>
        <div
          ref={featuredRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {featuredItems.map((item) => (
            <article
              key={item.id}
              className="relative shrink-0 snap-start w-[85vw] sm:w-[72vw] md:w-[48vw] lg:w-[34vw] h-[300px] md:h-[340px] rounded-2xl overflow-hidden shadow-lg bg-gray-900 group"
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => {
                    if (import.meta.env.DEV) console.log('Missing gallery image path:', item.url);
                  }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (import.meta.env.DEV) console.log('Missing gallery image path:', item.url);
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLDivElement | null;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              )}
              <div className="hidden absolute inset-0"><PlaceholderCard /></div>
              {item.type === 'video' ? (
                <div className="absolute top-3 right-3 rounded-full bg-black/45 p-2 text-white">
                  <Play className="w-4 h-4" />
                </div>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide">{item.category} • {item.location}</p>
                <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-200 text-sm mt-1 line-clamp-2">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {validBeforeAfterItems.length > 0 ? (
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-4 md:py-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-950 mb-4 md:mb-6">Before &amp; After</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {validBeforeAfterItems.map((item) => (
              <BeforeAfterSlider key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-700" />
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group text-left relative h-72 rounded-xl overflow-hidden shadow-md hover:shadow-xl md:hover:-translate-y-1 transition-all bg-gray-900"
                >
                  {item.type === 'video' ? (
                    <video src={item.url} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (import.meta.env.DEV) console.log('Missing gallery image path:', item.url);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLDivElement | null;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  )}
                  <div className="hidden absolute inset-0"><PlaceholderCard /></div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
                    <p className="text-[11px] uppercase tracking-wide text-emerald-200">{item.category} • {item.location}</p>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-gray-200 text-sm line-clamp-2 mt-1">{item.caption}</p>
                  </div>
                </button>
              ))}
            </div>
            {canShowMore ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowCount((c) => c + 6)}
                  className="rounded-xl bg-white border border-gray-200 px-6 py-3 text-gray-800 font-semibold hover:border-emerald-300 hover:text-emerald-800 transition"
                >
                  View More Work
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl max-h-[90vh] flex flex-col">
            {selectedItem.type === 'video' ? (
              <video
                src={selectedItem.url}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                autoPlay
                muted
                loop
                playsInline
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                decoding="async"
                onClick={(e) => e.stopPropagation()}
                onError={() => {
                  if (import.meta.env.DEV) console.log('Missing gallery image path:', selectedItem.url);
                }}
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{selectedItem.title}</h3>
              <p className="text-gray-300">{selectedItem.category} • {selectedItem.location}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 border-t border-gray-200">
        <p className="text-gray-600 text-center max-w-2xl mx-auto leading-relaxed mb-6">
          Want specifics by city? See{' '}
          <Link to="/stump-grinding-port-orange" className="text-emerald-700 font-semibold underline-offset-2 hover:underline">
            stump grinding in Port Orange
          </Link>{' '}
          or{' '}
          <Link to="/emergency-tree-service-volusia-county" className="text-emerald-700 font-semibold underline-offset-2 hover:underline">
            emergency tree service in Volusia County
          </Link>
          , then{' '}
          <Link to="/quote" className="text-emerald-700 font-semibold underline-offset-2 hover:underline">
            request your quote
          </Link>
          .
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-8 md:pb-12">
        <div className="max-w-3xl mx-auto text-center rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-8 md:p-10 shadow-xl">
          <h2 className="text-white font-bold text-3xl md:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 text-lg md:text-xl mt-2 mb-8">
            Let us take care of your tree service needs with the same quality and professionalism
          </p>
          <Link
            to="/quote"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold rounded-full px-8 py-3 hover:bg-emerald-100 shadow-lg transition-all duration-300"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
