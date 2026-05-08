import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Section from './Section';
import { reviewsApi } from '../services/api';

type PublicReview = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  city: string | null;
  service_type: string | null;
  featured: boolean;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(1, Math.round(Number(rating) || 1)));
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < n ? 'fill-amber-400 text-amber-500' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await reviewsApi.getApprovedForPublic();
        if (!cancelled) setReviews((rows as PublicReview[]) ?? []);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <Section variant="white">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">What customers say</h2>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 text-sm md:text-base">
        Real feedback from homeowners and businesses we&apos;ve served across Volusia County.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm flex flex-col h-full ${
              r.featured ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <figcaption className="font-bold text-gray-900">{r.customer_name}</figcaption>
              <Stars rating={r.rating} />
            </div>
            <blockquote className="text-sm text-gray-700 leading-relaxed flex-1">&ldquo;{r.review_text}&rdquo;</blockquote>
            {(r.city || r.service_type) && (
              <p className="mt-4 text-xs text-gray-500">
                {[r.service_type, r.city].filter(Boolean).join(' · ')}
              </p>
            )}
          </figure>
        ))}
      </div>
    </Section>
  );
}
