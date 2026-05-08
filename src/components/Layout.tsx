import { ReactNode, useCallback, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import JsonLd from './JsonLd';
import Navbar from './Navbar';
import { getLocalBusinessSchema } from '../schema/localBusiness';
import { seoPages } from '../data/seoPages';
import SeoQuickStrip, { POPULAR_LOCAL_LINKS } from './SeoQuickStrip';
import { phoneToTel, usePublicWorkspaceSettings } from '../lib/workspaceSettings';

const CORE_SERVICE_SLUGS = new Set([
  'tree-removal',
  'tree-trimming',
  'stump-grinding',
  'emergency-tree-service',
  'storm-cleanup',
  'crane-tree-work',
]);

const footerServices = seoPages.filter((p) => CORE_SERVICE_SLUGS.has(p.slug));
const footerServiceAreas = seoPages.filter((p) => p.intent === 'local-service');
const footerResources = seoPages.filter((p) => p.intent === 'informational');

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const email = settings.business.email;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';
  const telHref = `tel:${phoneToTel(phone)}`;

  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const isBlogRoute =
    location.pathname === '/blog' || location.pathname.startsWith('/blog/');

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.replace('#', ''));
    const t = window.setTimeout(() => scrollToSection(id), 40);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash, scrollToSection]);

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50/30">
      <JsonLd data={getLocalBusinessSchema()} />
      <Navbar />
      {isHomeRoute ? null : <div className="h-14 md:h-16" aria-hidden="true" />}
      {isBlogRoute ? <SeoQuickStrip /> : null}

      <main className="flex-grow pb-24 md:pb-16 lg:pb-14">
        {children}
      </main>

      <footer className="bg-gray-950 text-white py-8 md:py-10 mt-auto relative border-t border-emerald-700/40 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 md:mb-10 pb-4 md:pb-8 border-b border-gray-800">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Popular Local Guides
            </p>
            <nav
              aria-label="Popular local pages"
              className="overflow-x-auto overflow-y-hidden -mx-1 px-1 scroll-smooth [scrollbar-width:thin]"
            >
              <div className="flex flex-nowrap gap-2 pb-1 w-max max-w-none">
                {POPULAR_LOCAL_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-gray-100 bg-gray-800/90 border border-gray-700 hover:border-emerald-500/50 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <img
                src="/treetek-logo.png"
                alt="TREE TEK tree removal and stump grinding — Volusia County Florida"
                className="h-28 w-auto mb-4"
                loading="lazy"
                decoding="async"
              />
              <p className="text-gray-400 text-sm">
                Complete Tree Services & Stump Grinding
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/services" className="hover:text-emerald-300 transition-colors">Services</Link></li>
                <li><Link to="/past-work" className="hover:text-emerald-300 transition-colors">Past Work</Link></li>
                <li><Link to="/quote" className="hover:text-emerald-300 transition-colors">Get a Quote</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-300 transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-emerald-300 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Services</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {footerServices.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/${p.slug}`} className="hover:text-emerald-300 transition-colors">
                      {p.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Service areas</h3>
              <ul className="space-y-2 text-gray-400 text-sm columns-1">
                {footerServiceAreas.map((p) => (
                  <li key={p.slug} className="break-inside-avoid">
                    <Link to={`/${p.slug}`} className="hover:text-emerald-300 transition-colors">
                      {p.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {footerResources.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/${p.slug}`} className="hover:text-emerald-300 transition-colors">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-white">Contact</h3>
              <div className="space-y-2">
                <a href={telHref} className="flex items-center gap-2 text-gray-100 hover:text-emerald-300 transition-colors">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>{phone}</span>
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-100 hover:text-emerald-300 transition-colors">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>{email}</span>
                </a>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-md md:text-right">
              Licensed &amp; insured tree service serving Volusia County and surrounding areas.
            </p>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} TREE TEK. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-6px_24px_-8px_rgba(0,0,0,0.12)] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 max-w-lg mx-auto">
          <a
            href={telHref}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition text-sm shadow-sm min-h-[44px]"
          >
            <Phone className="w-4 h-4 shrink-0" />
            Call Now
          </a>
          <Link
            to="/quote"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-2 rounded-lg flex items-center justify-center transition text-sm shadow-sm min-h-[44px]"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
