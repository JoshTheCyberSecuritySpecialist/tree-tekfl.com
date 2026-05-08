import { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

type BusinessInfo = {
  phone: string;
  email: string;
  city: string;
  service_area: string;
};

type SiteDefaults = {
  cta_text: string;
};

export type PublicWorkspaceSettings = {
  business: BusinessInfo;
  site: SiteDefaults;
};

const FALLBACK_SETTINGS: PublicWorkspaceSettings = {
  business: {
    phone: '321-282-9795',
    email: 'info@treetekfl.com',
    city: 'Daytona Beach',
    service_area: 'Volusia County, FL',
  },
  site: {
    cta_text: 'Request a Free Quote',
  },
};

let cachedSettings: PublicWorkspaceSettings | null = null;
let inflight: Promise<PublicWorkspaceSettings> | null = null;

function normalizeBusinessInfo(input: unknown): BusinessInfo {
  const obj = (input && typeof input === 'object' ? input : {}) as Partial<BusinessInfo>;
  return {
    phone: String(obj.phone || FALLBACK_SETTINGS.business.phone),
    email: String(obj.email || FALLBACK_SETTINGS.business.email),
    city: String(obj.city || FALLBACK_SETTINGS.business.city),
    service_area: String(obj.service_area || FALLBACK_SETTINGS.business.service_area),
  };
}

function normalizeSiteDefaults(input: unknown): SiteDefaults {
  const obj = (input && typeof input === 'object' ? input : {}) as Partial<SiteDefaults>;
  return {
    cta_text: String(obj.cta_text || FALLBACK_SETTINGS.site.cta_text),
  };
}

export function phoneToTel(phone: string): string {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!digits) return '3212829795';
  return digits.startsWith('+') ? digits : digits.replace(/[^\d]/g, '');
}

export async function loadPublicWorkspaceSettings(): Promise<PublicWorkspaceSettings> {
  if (cachedSettings) return cachedSettings;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const [businessRaw, siteRaw] = await Promise.all([
        settingsApi.getSetting('business_info', FALLBACK_SETTINGS.business),
        settingsApi.getSetting('site_defaults', FALLBACK_SETTINGS.site),
      ]);

      cachedSettings = {
        business: normalizeBusinessInfo(businessRaw),
        site: normalizeSiteDefaults(siteRaw),
      };
      return cachedSettings;
    } catch {
      cachedSettings = FALLBACK_SETTINGS;
      return FALLBACK_SETTINGS;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function usePublicWorkspaceSettings() {
  const [settings, setSettings] = useState<PublicWorkspaceSettings>(cachedSettings || FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    let mounted = true;
    loadPublicWorkspaceSettings()
      .then((resolved) => {
        if (!mounted) return;
        setSettings(resolved);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSettings(FALLBACK_SETTINGS);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading };
}

