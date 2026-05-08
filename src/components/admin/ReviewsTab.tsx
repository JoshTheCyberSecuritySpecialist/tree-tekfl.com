import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Copy, Star, Trash2, Pencil, Sparkles } from 'lucide-react';
import { reviewsApi } from '../../services/api';

type ReviewStatus = 'approved' | 'pending' | 'hidden';

export type AdminReview = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  source: string;
  city: string | null;
  service_type: string | null;
  status: ReviewStatus;
  google_review_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  customer_name: '',
  rating: 5,
  review_text: '',
  source: 'manual',
  city: '',
  service_type: '',
  status: 'approved' as ReviewStatus,
  google_review_url: '',
  featured: false,
};

function StarsDisplay({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(1, Math.round(Number(rating) || 1)));
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 shrink-0 ${i < n ? 'fill-amber-400 text-amber-500' : 'text-gray-200'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function preview(text: string, max = 140) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function buildReviewRequestMessage(link: string) {
  const url = (link ?? '').trim();
  return `Thank you for choosing TREE TEK. If you were happy with our service, please leave us a quick Google review here: ${url || '[your Google review link]'}`;
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(true);
  const [shareSaving, setShareSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await reviewsApi.getAllForAdmin();
      setReviews((rows as AdminReview[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShare = useCallback(async () => {
    setShareLoading(true);
    try {
      const s = await reviewsApi.getReviewRequestSettings();
      setShareUrl((s?.google_review_url as string) ?? '');
    } catch {
      setShareUrl('');
    } finally {
      setShareLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
    loadShare();
  }, [loadReviews, loadShare]);

  useEffect(() => {
    if (!banner || banner.type !== 'ok') return;
    const t = window.setTimeout(() => setBanner(null), 2800);
    return () => window.clearTimeout(t);
  }, [banner]);

  const setField = (key: keyof typeof form, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const clearForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (r: AdminReview) => {
    setEditingId(r.id);
    setForm({
      customer_name: r.customer_name,
      rating: r.rating,
      review_text: r.review_text,
      source: r.source || 'manual',
      city: r.city ?? '',
      service_type: r.service_type ?? '',
      status: (['approved', 'pending', 'hidden'].includes(r.status) ? r.status : 'approved') as ReviewStatus,
      google_review_url: r.google_review_url ?? '',
      featured: Boolean(r.featured),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      const payload = {
        ...form,
        city: form.city || null,
        service_type: form.service_type || null,
        google_review_url: form.google_review_url || null,
      };
      if (editingId) {
        await reviewsApi.updateReview(editingId, payload);
        setBanner({ type: 'ok', text: 'Review updated.' });
      } else {
        await reviewsApi.createReview(payload);
        setBanner({ type: 'ok', text: 'Review saved.' });
      }
      clearForm();
      await loadReviews();
    } catch (err) {
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await reviewsApi.deleteReview(id);
      setBanner({ type: 'ok', text: 'Review deleted.' });
      if (editingId === id) clearForm();
      await loadReviews();
    } catch (err) {
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  const onToggleFeatured = async (r: AdminReview) => {
    try {
      await reviewsApi.setReviewFeatured(r.id, !r.featured);
      setReviews((list) => list.map((x) => (x.id === r.id ? { ...x, featured: !r.featured } : x)));
      setBanner({ type: 'ok', text: !r.featured ? 'Marked featured.' : 'Removed from featured.' });
    } catch (err) {
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  const onStatusRow = async (id: string, status: ReviewStatus) => {
    const prev = reviews;
    setReviews((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await reviewsApi.setReviewStatus(id, status);
    } catch (err) {
      setReviews(prev);
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Status update failed' });
    }
  };

  const saveShareUrl = async () => {
    setShareSaving(true);
    setBanner(null);
    try {
      await reviewsApi.saveReviewRequestSettings(shareUrl);
      setBanner({ type: 'ok', text: 'Google review link saved.' });
    } catch (err) {
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Could not save link' });
    } finally {
      setShareSaving(false);
    }
  };

  const copyRequestMessage = async () => {
    const msg = buildReviewRequestMessage(shareUrl);
    try {
      await navigator.clipboard.writeText(msg);
      setBanner({ type: 'ok', text: 'Message copied to clipboard.' });
    } catch {
      setBanner({ type: 'err', text: 'Clipboard not available. Copy the text manually from the preview below.' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading reviews…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm space-y-3">
        <p className="font-semibold">Could not load reviews</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs">
          Apply the latest Supabase migration for <code className="bg-white/70 px-1 rounded">reviews</code> and reload.
        </p>
        <button
          type="button"
          onClick={() => loadReviews()}
          className="rounded-lg bg-red-900 text-white px-4 py-2 text-sm font-semibold hover:bg-red-950"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {banner ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            banner.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {banner.text}
          {banner.type === 'err' ? (
            <button type="button" className="ml-3 underline" onClick={() => setBanner(null)}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Review request tools</h2>
        <p className="text-sm text-gray-600">
          Save your primary Google review URL, then copy a ready-to-send message for happy customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Google review link</label>
            <input
              type="url"
              value={shareUrl}
              disabled={shareLoading}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://g.page/..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={shareSaving || shareLoading}
            onClick={saveShareUrl}
            className="rounded-xl bg-emerald-800 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
          >
            {shareSaving ? 'Saving…' : 'Save link'}
          </button>
          <button
            type="button"
            onClick={copyRequestMessage}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy review request message
          </button>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-700 whitespace-pre-wrap">
          {buildReviewRequestMessage(shareUrl)}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit review' : 'Add review'}</h2>
          {editingId ? (
            <button type="button" onClick={clearForm} className="text-sm font-semibold text-emerald-800 hover:underline">
              Cancel edit
            </button>
          ) : null}
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Customer name</label>
            <input
              required
              value={form.customer_name}
              onChange={(e) => setField('customer_name', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Rating (1–5)</label>
            <select
              value={form.rating}
              onChange={(e) => setField('rating', Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setField('status', e.target.value as ReviewStatus)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
            <input
              value={form.source}
              onChange={(e) => setField('source', e.target.value)}
              placeholder="manual, google, …"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
            <input
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service type</label>
            <input
              value={form.service_type}
              onChange={(e) => setField('service_type', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Google review URL (this review)</label>
            <input
              type="url"
              value={form.google_review_url}
              onChange={(e) => setField('google_review_url', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Review text</label>
            <textarea
              required
              rows={4}
              value={form.review_text}
              onChange={(e) => setField('review_text', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setField('featured', e.target.checked)}
              className="rounded border-gray-300 text-emerald-800 focus:ring-emerald-700"
            />
            Featured on homepage
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update review' : 'Save review'}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Clear form
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">All reviews</h2>
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
            <p className="font-medium text-gray-800">No reviews yet.</p>
            <p className="text-sm mt-1">Add a testimonial above or approve pending entries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{r.customer_name}</p>
                    <StarsDisplay rating={r.rating} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {r.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Featured
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-900'
                          : r.status === 'pending'
                            ? 'bg-amber-50 text-amber-900'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{preview(r.review_text)}</p>
                <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                  {r.city ? <span>{r.city}</span> : null}
                  {r.service_type ? <span>{r.service_type}</span> : null}
                  <span>{r.source}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                    Status
                    <select
                      value={r.status}
                      onChange={(e) => onStatusRow(r.id, e.target.value as ReviewStatus)}
                      className="rounded-lg border border-gray-200 text-sm font-medium px-2 py-1"
                    >
                      <option value="approved">approved</option>
                      <option value="pending">pending</option>
                      <option value="hidden">hidden</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(r)}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {r.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 text-red-800 px-3 py-1 text-xs font-semibold hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
