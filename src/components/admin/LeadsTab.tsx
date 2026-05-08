import { useCallback, useEffect, useMemo, useState } from 'react';
import { Phone, Mail, X, Eye } from 'lucide-react';
import { quoteApi } from '../../services/api';
import { isLikelyValidImageUrl } from '../../lib/blogUtils';

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost';

const PIPELINE: { status: LeadStatus; label: string }[] = [
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'completed', label: 'Completed' },
  { status: 'lost', label: 'Lost' },
];

function normalizeStatus(raw: string | null | undefined): LeadStatus {
  const s = (raw ?? '').trim().toLowerCase();
  if (s === 'contacted' || s === 'scheduled' || s === 'completed' || s === 'lost' || s === 'new') {
    return s;
  }
  return 'new';
}

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  service_type: string;
  urgency: string;
  preferred_date: string | null;
  description: string;
  photos?: string[] | null;
  status?: string | null;
  created_at: string;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function previewText(text: string, max = 120) {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function parsePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

function LeadDetailModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  const urls = parsePhotos(lead.photos).filter((u) => isLikelyValidImageUrl(u));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 py-3 rounded-t-2xl">
          <h2 id="lead-detail-title" className="text-lg font-bold text-gray-900 truncate pr-2">
            {lead.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm text-gray-800">
          <div className="grid gap-2">
            <p>
              <span className="font-semibold text-gray-600">Phone:</span>{' '}
              <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="text-emerald-800 font-medium hover:underline">
                {lead.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Email:</span>{' '}
              <a href={`mailto:${lead.email}`} className="text-emerald-800 font-medium hover:underline break-all">
                {lead.email}
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Address:</span> {lead.address}
            </p>
            <p>
              <span className="font-semibold text-gray-600">City / ZIP:</span> {lead.city}, {lead.zip}
            </p>
            <p>
              <span className="font-semibold text-gray-600">Service:</span> {lead.service_type}
            </p>
            <p>
              <span className="font-semibold text-gray-600">Urgency:</span> {lead.urgency}
            </p>
            {lead.preferred_date ? (
              <p>
                <span className="font-semibold text-gray-600">Preferred date:</span> {lead.preferred_date}
              </p>
            ) : null}
            <p>
              <span className="font-semibold text-gray-600">Status:</span>{' '}
              <span className="capitalize">{normalizeStatus(lead.status)}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Submitted:</span> {formatWhen(lead.created_at)}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-600 mb-1">Message</p>
            <p className="text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100">
              {lead.description || '—'}
            </p>
          </div>
          {urls.length > 0 ? (
            <div>
              <p className="font-semibold text-gray-600 mb-2">Photos</p>
              <div className="flex flex-wrap gap-2">
                {urls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 overflow-hidden w-24 h-24 bg-gray-100 shrink-0"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onStatusChange,
  onViewDetails,
  busy,
}: {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onViewDetails: (lead: Lead) => void;
  busy: boolean;
}) {
  const current = normalizeStatus(lead.status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 leading-tight">{lead.name}</p>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="text-emerald-800 font-semibold hover:underline">
            {lead.phone}
          </a>
        </p>
        {lead.email ? (
          <p className="truncate">
            <a href={`mailto:${lead.email}`} className="text-emerald-700 hover:underline">
              {lead.email}
            </a>
          </p>
        ) : null}
        <p>{lead.service_type}</p>
        <p>{lead.city}</p>
        <p className="text-gray-500">{formatWhen(lead.created_at)}</p>
      </div>
      {lead.description ? (
        <p className="text-xs text-gray-600 line-clamp-3 border-t border-gray-100 pt-2">{previewText(lead.description)}</p>
      ) : null}
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">Stage</label>
      <select
        value={current}
        disabled={busy}
        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
      >
        {PIPELINE.map(({ status, label }) => (
          <option key={status} value={status}>
            {label}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={`tel:${lead.phone.replace(/\s/g, '')}`}
          className="inline-flex flex-1 min-w-[5rem] items-center justify-center gap-1 rounded-lg bg-emerald-800 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-900"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          Call
        </a>
        <button
          type="button"
          onClick={() => onViewDetails(lead)}
          className="inline-flex flex-1 min-w-[5rem] items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          View details
        </button>
      </div>
    </div>
  );
}

export default function LeadsTab() {
  const [rawLeads, setRawLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await quoteApi.getQuoteRequests();
      setRawLeads((rows as Lead[]) ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load leads';
      setError(msg);
      setRawLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!banner || banner.type !== 'success') return;
    const t = window.setTimeout(() => setBanner(null), 3200);
    return () => window.clearTimeout(t);
  }, [banner]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    rawLeads.forEach((l) => {
      if (l.service_type?.trim()) set.add(l.service_type.trim());
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rawLeads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawLeads.filter((l) => {
      if (statusFilter !== 'all' && normalizeStatus(l.status) !== statusFilter) return false;
      if (serviceFilter !== 'all' && (l.service_type ?? '').trim() !== serviceFilter) return false;
      if (!q) return true;
      const hay = [l.name, l.phone, l.city, l.service_type, l.email]
        .map((x) => (x ?? '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [rawLeads, search, serviceFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      scheduled: [],
      completed: [],
      lost: [],
    };
    filteredLeads.forEach((l) => {
      map[normalizeStatus(l.status)].push(l);
    });
    return map;
  }, [filteredLeads]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const prev = rawLeads;
    setRawLeads((list) => list.map((l) => (l.id === id ? { ...l, status } : l)));
    setUpdatingId(id);
    setBanner(null);
    try {
      await quoteApi.updateServiceRequestStatus(id, status);
      setBanner({ type: 'success', text: 'Stage updated.' });
    } catch (e) {
      setRawLeads(prev);
      const msg = e instanceof Error ? e.message : 'Update failed';
      setBanner({ type: 'error', text: msg });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading leads…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm space-y-3">
        <p className="font-semibold">Could not load leads</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs text-red-800">
          If the error mentions a missing <code className="bg-white/60 px-1 rounded">status</code> column, apply the
          latest Supabase migration (<code className="bg-white/60 px-1 rounded">service_requests_lead_status</code>)
          and reload.
        </p>
        <button
          type="button"
          onClick={() => load()}
          className="rounded-lg bg-red-900 text-white px-4 py-2 text-sm font-semibold hover:bg-red-950"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {banner.text}
          {banner.type === 'error' ? (
            <button type="button" className="ml-3 underline text-sm" onClick={() => setBanner(null)}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <div className="flex-1 min-w-[12rem]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, phone, city, service…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[10rem]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service type</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All services' : s}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[10rem]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All stages</option>
              {PIPELINE.map(({ status, label }) => (
                <option key={status} value={status}>
                  {label} only
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {rawLeads.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
          <Mail className="h-10 w-10 mx-auto text-gray-300 mb-3" aria-hidden />
          <p className="font-medium text-gray-800">No leads found yet.</p>
          <p className="text-sm mt-1">New quote requests will appear here.</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
          <p className="font-medium text-gray-800">No leads match your filters.</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-emerald-800 hover:underline"
            onClick={() => {
              setSearch('');
              setServiceFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-3 xl:items-start">
          {PIPELINE.map(({ status, label }) => {
            const list = grouped[status];
            return (
              <section
                key={status}
                className="flex-1 min-w-0 xl:min-w-[160px] rounded-2xl border border-gray-200/80 bg-gray-50/80 p-3 shadow-inner"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 rounded-full px-2 py-0.5">
                    {list.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {list.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6 px-2">No leads in this stage.</p>
                  ) : (
                    list.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        busy={updatingId === lead.id}
                        onStatusChange={handleStatusChange}
                        onViewDetails={setDetailLead}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
    </div>
  );
}
