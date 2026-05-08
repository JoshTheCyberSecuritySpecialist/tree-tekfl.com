import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { MailPlus, Shield, Bell, Building2, Trash2 } from 'lucide-react';
import { adminUsersApi, settingsApi } from '../../services/api';
import { supabase } from '../../lib/supabase';

type AdminRow = {
  id: string;
  email: string | null;
  created_at: string;
};

type BusinessInfoState = {
  phone: string;
  email: string;
  service_area: string;
};

type SiteDefaultsState = {
  cta_text: string;
};

type NotificationsState = {
  email_enabled: boolean;
  lead_alerts: boolean;
};

const DEFAULT_BUSINESS: BusinessInfoState = {
  phone: '321-282-9795',
  email: 'info@treetekfl.com',
  service_area: 'Volusia County, FL',
};

const DEFAULT_SITE: SiteDefaultsState = {
  cta_text: 'Request a Free Quote',
};

const DEFAULT_NOTIFICATIONS: NotificationsState = {
  email_enabled: true,
  lead_alerts: true,
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function asObject<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== 'object') return fallback;
  return { ...fallback, ...(value as object) } as T;
}

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const [businessInfo, setBusinessInfo] = useState<BusinessInfoState>(DEFAULT_BUSINESS);
  const [siteDefaults, setSiteDefaults] = useState<SiteDefaultsState>(DEFAULT_SITE);
  const [notifications, setNotifications] = useState<NotificationsState>(DEFAULT_NOTIFICATIONS);

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [removingAdminId, setRemovingAdminId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        adminsRows,
        businessRaw,
        notificationsRaw,
        siteRaw,
        {
          data: { user },
        },
      ] = await Promise.all([
        adminUsersApi.listAdminUsers(),
        settingsApi.getSetting('business_info', DEFAULT_BUSINESS),
        settingsApi.getSetting('notifications', DEFAULT_NOTIFICATIONS),
        settingsApi.getSetting('site_defaults', DEFAULT_SITE),
        supabase.auth.getUser(),
      ]);

      setAdmins((adminsRows as AdminRow[]) || []);
      setBusinessInfo(asObject<BusinessInfoState>(businessRaw, DEFAULT_BUSINESS));
      setNotifications(asObject<NotificationsState>(notificationsRaw, DEFAULT_NOTIFICATIONS));
      setSiteDefaults(asObject<SiteDefaultsState>(siteRaw, DEFAULT_SITE));
      setCurrentUserId(user?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workspace settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice || notice.type !== 'ok') return;
    const t = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(t);
  }, [notice]);

  const canRemoveMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const a of admins) {
      map.set(a.id, admins.length > 1 && a.id !== currentUserId);
    }
    return map;
  }, [admins, currentUserId]);

  async function saveBusinessInfo(e: FormEvent) {
    e.preventDefault();
    setSavingBusiness(true);
    setNotice(null);
    try {
      await settingsApi.updateSetting('business_info', businessInfo);
      setNotice({ type: 'ok', text: 'Business info saved.' });
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to save business info.' });
    } finally {
      setSavingBusiness(false);
    }
  }

  async function saveSiteDefaults(e: FormEvent) {
    e.preventDefault();
    setSavingSite(true);
    setNotice(null);
    try {
      await settingsApi.updateSetting('site_defaults', siteDefaults);
      setNotice({ type: 'ok', text: 'Site defaults saved.' });
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to save site defaults.' });
    } finally {
      setSavingSite(false);
    }
  }

  async function saveNotifications(e: FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    setNotice(null);
    try {
      await settingsApi.updateSetting('notifications', notifications);
      setNotice({ type: 'ok', text: 'Notification settings saved.' });
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to save notifications.' });
    } finally {
      setSavingNotifications(false);
    }
  }

  async function handleAddAdmin(e: FormEvent) {
    e.preventDefault();
    const email = addAdminEmail.trim();
    if (!email) return;
    setAddingAdmin(true);
    setNotice(null);
    try {
      const user = await adminUsersApi.findAuthUserByEmail(email);
      if (!user?.id) {
        throw new Error('No authenticated user found with that email.');
      }
      await adminUsersApi.addAdmin(user.id);
      setAddAdminEmail('');
      setNotice({ type: 'ok', text: `Admin access granted to ${user.email || email}.` });
      await load();
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to add admin.' });
    } finally {
      setAddingAdmin(false);
    }
  }

  async function handleRemoveAdmin(row: AdminRow) {
    if (!canRemoveMap.get(row.id)) return;
    if (!confirm(`Remove admin access for ${row.email || row.id}?`)) return;
    setRemovingAdminId(row.id);
    setNotice(null);
    try {
      await adminUsersApi.removeAdmin(row.id);
      setNotice({ type: 'ok', text: 'Admin access removed.' });
      await load();
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to remove admin.' });
    } finally {
      setRemovingAdminId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading workspace settings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm space-y-3">
        <p className="font-semibold">Could not load workspace settings</p>
        <p className="text-sm">{error}</p>
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
    <div className="space-y-6">
      {notice ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          Business Info
        </h2>
        <p className="text-sm text-gray-600 mb-4">Used across contact links, CTA labels, and footer defaults.</p>
        <form onSubmit={saveBusinessInfo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone number</label>
            <input
              value={businessInfo.phone}
              onChange={(e) => setBusinessInfo((v) => ({ ...v, phone: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => setBusinessInfo((v) => ({ ...v, email: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service area text</label>
            <input
              value={businessInfo.service_area}
              onChange={(e) => setBusinessInfo((v) => ({ ...v, service_area: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={savingBusiness}
              className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
            >
              {savingBusiness ? 'Saving…' : 'Save business info'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-700" />
          Admin Access
        </h2>
        <p className="text-sm text-gray-600 mb-4">Grant or revoke access to the admin workspace.</p>

        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 sm:items-end mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Add admin by email</label>
            <input
              type="email"
              required
              value={addAdminEmail}
              onChange={(e) => setAddAdminEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={addingAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
          >
            <MailPlus className="w-4 h-4" />
            {addingAdmin ? 'Adding…' : 'Add admin'}
          </button>
        </form>

        <div className="rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Added</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-4 text-gray-900">{a.email || 'Unknown'}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 break-all">{a.id}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatWhen(a.created_at)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      disabled={!canRemoveMap.get(a.id) || removingAdminId === a.id}
                      onClick={() => handleRemoveAdmin(a)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 text-red-800 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">You cannot remove your own access or the last remaining admin.</p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-700" />
          Notifications & Site Defaults
        </h2>
        <p className="text-sm text-gray-600 mb-4">Future-ready toggles persisted as JSON now.</p>

        <form onSubmit={saveNotifications} className="space-y-3 mb-5">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={notifications.email_enabled}
              onChange={(e) => setNotifications((v) => ({ ...v, email_enabled: e.target.checked }))}
            />
            Email alerts enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={notifications.lead_alerts}
              onChange={(e) => setNotifications((v) => ({ ...v, lead_alerts: e.target.checked }))}
            />
            Lead notifications enabled
          </label>
          <button
            type="submit"
            disabled={savingNotifications}
            className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50"
          >
            {savingNotifications ? 'Saving…' : 'Save notifications'}
          </button>
        </form>

        <form onSubmit={saveSiteDefaults} className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Default CTA text</label>
            <input
              value={siteDefaults.cta_text}
              onChange={(e) => setSiteDefaults((v) => ({ ...v, cta_text: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={savingSite}
            className="rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {savingSite ? 'Saving…' : 'Save site defaults'}
          </button>
        </form>
      </section>
    </div>
  );
}

