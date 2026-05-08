import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, FileText, ImageIcon, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type QuoteRow = {
  id: string;
  name: string;
  phone: string;
  service_type: string;
  city: string;
  urgency: string;
  created_at: string;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

type PastWorkRow = {
  id: string;
  title: string;
  location: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function KpiCard({
  label,
  value,
  failed,
  icon: Icon,
}: {
  label: string;
  value: number | null;
  failed: boolean;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
        {failed ? '—' : value ?? '—'}
      </p>
      {failed ? <p className="mt-1 text-xs text-amber-700">Could not load</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  children: React.ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {isEmpty ? <p className="text-sm text-gray-500 py-6 text-center">{emptyMessage}</p> : children}
    </div>
  );
}

export default function DashboardTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [quoteTotal, setQuoteTotal] = useState<number | null>(null);
  const [blogTotal, setBlogTotal] = useState<number | null>(null);
  const [pastWorkTotal, setPastWorkTotal] = useState<number | null>(null);
  const [emergencyTotal, setEmergencyTotal] = useState<number | null>(null);
  const [quoteTotalErr, setQuoteTotalErr] = useState(false);
  const [blogTotalErr, setBlogTotalErr] = useState(false);
  const [pastWorkTotalErr, setPastWorkTotalErr] = useState(false);
  const [emergencyTotalErr, setEmergencyTotalErr] = useState(false);

  const [recentQuotes, setRecentQuotes] = useState<QuoteRow[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogRow[]>([]);
  const [recentPastWork, setRecentPastWork] = useState<PastWorkRow[]>([]);
  const [quotesListErr, setQuotesListErr] = useState<string | null>(null);
  const [blogsListErr, setBlogsListErr] = useState<string | null>(null);
  const [pastWorkListErr, setPastWorkListErr] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const nextWarnings: string[] = [];
    setQuoteTotalErr(false);
    setBlogTotalErr(false);
    setPastWorkTotalErr(false);
    setEmergencyTotalErr(false);
    setQuotesListErr(null);
    setBlogsListErr(null);
    setPastWorkListErr(null);

    const countReq = supabase.from('service_requests').select('*', { count: 'exact', head: true });
    const countEmergency = supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('urgency', 'Emergency');
    const countBlog = supabase.from('blog_posts').select('*', { count: 'exact', head: true });
    const countGallery = supabase.from('gallery_images').select('*', { count: 'exact', head: true });
    const listQuotes = supabase
      .from('service_requests')
      .select('id, name, phone, service_type, city, urgency, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    const listBlogs = supabase
      .from('blog_posts')
      .select('id, title, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    const listGallery = supabase
      .from('gallery_images')
      .select('id, title, location, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const [cr, ce, cb, cg, lr, lb, lg] = await Promise.all([
      countReq,
      countEmergency,
      countBlog,
      countGallery,
      listQuotes,
      listBlogs,
      listGallery,
    ]);

    if (cr.error) {
      setQuoteTotal(null);
      setQuoteTotalErr(true);
      nextWarnings.push(`Quote requests count: ${cr.error.message}`);
    } else {
      setQuoteTotal(cr.count ?? 0);
    }

    if (ce.error) {
      setEmergencyTotal(null);
      setEmergencyTotalErr(true);
      nextWarnings.push(`Emergency requests count: ${ce.error.message}`);
    } else {
      setEmergencyTotal(ce.count ?? 0);
    }

    if (cb.error) {
      setBlogTotal(null);
      setBlogTotalErr(true);
      nextWarnings.push(`Blog posts count: ${cb.error.message}`);
    } else {
      setBlogTotal(cb.count ?? 0);
    }

    if (cg.error) {
      setPastWorkTotal(null);
      setPastWorkTotalErr(true);
      nextWarnings.push(`Past work count: ${cg.error.message}`);
    } else {
      setPastWorkTotal(cg.count ?? 0);
    }

    if (lr.error) {
      setRecentQuotes([]);
      setQuotesListErr(lr.error.message);
      nextWarnings.push(`Recent quotes: ${lr.error.message}`);
    } else {
      setRecentQuotes((lr.data as QuoteRow[]) ?? []);
    }

    if (lb.error) {
      setRecentBlogs([]);
      setBlogsListErr(lb.error.message);
      nextWarnings.push(`Recent blog: ${lb.error.message}`);
    } else {
      setRecentBlogs((lb.data as BlogRow[]) ?? []);
    }

    if (lg.error) {
      setRecentPastWork([]);
      setPastWorkListErr(lg.error.message);
      nextWarnings.push(`Recent past work: ${lg.error.message}`);
    } else {
      setRecentPastWork((lg.data as PastWorkRow[]) ?? []);
    }

    setWarnings(nextWarnings);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading dashboard…</p>
      </div>
    );
  }

  const allKpiFailed =
    quoteTotalErr && blogTotalErr && pastWorkTotalErr && emergencyTotalErr;
  const allListsFailed = Boolean(quotesListErr && blogsListErr && pastWorkListErr);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {warnings.length > 0 ? (
          <div
            className={`flex-1 min-w-0 rounded-xl border px-4 py-3 text-sm ${
              allKpiFailed && allListsFailed
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-semibold">
              {allKpiFailed && allListsFailed ? 'Could not load dashboard data' : 'Some data could not be loaded'}
            </p>
            <ul className="mt-1 list-disc list-inside text-xs opacity-90">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Snapshot of requests, content, and gallery projects.</p>
        )}
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total quote requests"
          value={quoteTotal}
          failed={quoteTotalErr}
          icon={ClipboardList}
        />
        <KpiCard label="Total blog posts" value={blogTotal} failed={blogTotalErr} icon={FileText} />
        <KpiCard
          label="Total past work items"
          value={pastWorkTotal}
          failed={pastWorkTotalErr}
          icon={ImageIcon}
        />
        <KpiCard
          label="Emergency quote requests"
          value={emergencyTotal}
          failed={emergencyTotalErr}
          icon={Zap}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard
          title="Recent quote requests"
          isEmpty={!quotesListErr && recentQuotes.length === 0}
          emptyMessage="No quote requests yet."
        >
          {quotesListErr ? (
            <p className="text-sm text-red-700">{quotesListErr}</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Service</th>
                    <th className="py-2 pr-3">City</th>
                    <th className="py-2 pr-3">Urgency</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {recentQuotes.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{r.phone}</td>
                      <td className="py-2.5 pr-3">{r.service_type}</td>
                      <td className="py-2.5 pr-3">{r.city}</td>
                      <td className="py-2.5 pr-3">
                        {r.urgency === 'Emergency' ? (
                          <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            Emergency
                          </span>
                        ) : (
                          <span className="text-gray-600">{r.urgency || '—'}</span>
                        )}
                      </td>
                      <td className="py-2.5 whitespace-nowrap text-gray-600">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent blog posts"
          isEmpty={!blogsListErr && recentBlogs.length === 0}
          emptyMessage="No blog posts yet."
        >
          {blogsListErr ? (
            <p className="text-sm text-red-700">{blogsListErr}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentBlogs.map((b) => (
                <li key={b.id} className="py-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/blog/${encodeURIComponent(b.slug)}`}
                      className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      {b.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{b.slug}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatDate(b.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent past work"
        isEmpty={!pastWorkListErr && recentPastWork.length === 0}
        emptyMessage="No gallery projects yet."
      >
        {pastWorkListErr ? (
          <p className="text-sm text-red-700">{pastWorkListErr}</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Location</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {recentPastWork.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{p.title}</td>
                    <td className="py-2.5 pr-3">{p.location ?? '—'}</td>
                    <td className="py-2.5 whitespace-nowrap text-gray-600">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
