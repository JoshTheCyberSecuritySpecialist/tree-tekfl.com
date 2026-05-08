import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ExternalLink, Pencil } from 'lucide-react';
import { sitePagesApi } from '../../services/api';

export type SitePageRow = {
  id: string;
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
  status: 'published' | 'draft';
  featured_image_url: string | null;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  slug: '',
  title: '',
  meta_title: '',
  meta_description: '',
  h1: '',
  excerpt: '',
  content: '',
  page_type: 'seo',
  location: '',
  service_type: '',
  featured_image_url: '',
  status: 'draft' as 'published' | 'draft',
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function PagesTab() {
  const [rows, setRows] = useState<SitePageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sitePagesApi.getAllForAdmin();
      setRows((data as SitePageRow[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pages');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!banner || banner.type !== 'ok') return;
    const t = window.setTimeout(() => setBanner(null), 2800);
    return () => window.clearTimeout(t);
  }, [banner]);

  const clearForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (r: SitePageRow) => {
    setEditingId(r.id);
    setForm({
      slug: r.slug,
      title: r.title,
      meta_title: r.meta_title ?? '',
      meta_description: r.meta_description ?? '',
      h1: r.h1 ?? '',
      excerpt: r.excerpt ?? '',
      content: r.content ?? '',
      page_type: r.page_type || 'seo',
      location: r.location ?? '',
      service_type: r.service_type ?? '',
      featured_image_url: r.featured_image_url ?? '',
      status: r.status === 'published' ? 'published' : 'draft',
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
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        h1: form.h1 || null,
        excerpt: form.excerpt || null,
        location: form.location || null,
        service_type: form.service_type || null,
        featured_image_url: form.featured_image_url || null,
      };
      if (editingId) {
        await sitePagesApi.updatePage(editingId, payload);
        setBanner({ type: 'ok', text: 'Page updated.' });
      } else {
        await sitePagesApi.createPage(payload);
        setBanner({ type: 'ok', text: 'Page created.' });
      }
      clearForm();
      await load();
    } catch (err) {
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (r: SitePageRow) => {
    const next = r.status === 'published' ? 'draft' : 'published';
    const prev = rows;
    setRows((list) => list.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    try {
      await sitePagesApi.setPageStatus(r.id, next);
      setBanner({ type: 'ok', text: next === 'published' ? 'Published.' : 'Unpublished (draft).' });
    } catch (err) {
      setRows(prev);
      setBanner({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading pages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm space-y-3">
        <p className="font-semibold">Could not load site pages</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs">
          Apply the <code className="bg-white/60 px-1 rounded">site_pages</code> migration, then retry.
        </p>
        <button type="button" onClick={() => load()} className="rounded-lg bg-red-900 text-white px-4 py-2 text-sm font-semibold">
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
            banner.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit page' : 'Create page'}</h2>
          {editingId ? (
            <button type="button" onClick={clearForm} className="text-sm font-semibold text-emerald-800 hover:underline">
              Cancel edit
            </button>
          ) : null}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Published pages override the hardcoded SEO page for the same URL when present. New slugs appear on the site once published (routes refresh on load).
        </p>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. tree-removal-port-orange"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'published' | 'draft' }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Meta title</label>
            <input
              value={form.meta_title}
              onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">H1</label>
            <input
              value={form.h1}
              onChange={(e) => setForm((f) => ({ ...f, h1: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Meta description</label>
            <textarea
              rows={2}
              value={form.meta_description}
              onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Excerpt (intro)</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service type</label>
            <input
              value={form.service_type}
              onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Page type</label>
            <input
              value={form.page_type}
              onChange={(e) => setForm((f) => ({ ...f, page_type: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Featured image URL</label>
            <input
              type="url"
              value={form.featured_image_url}
              onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Content (Markdown)</label>
            <textarea
              rows={14}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono"
              placeholder={'## Section\n\nBody copy with **bold** and [links](https://example.com).'}
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update page' : 'Save page'}
            </button>
            <button type="button" onClick={clearForm} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
              Clear form
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">All pages</h2>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            No CMS pages yet. Create one above to override or add SEO content.
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 font-medium text-gray-900">{r.title}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{r.slug}</td>
                      <td className="py-3 px-4 text-gray-600">{r.page_type}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.status === 'published' ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatWhen(r.updated_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => window.open(`/${r.slug}`, '_blank', 'noopener,noreferrer')}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublish(r)}
                            className="rounded-lg bg-emerald-800 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-emerald-900"
                          >
                            {r.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
