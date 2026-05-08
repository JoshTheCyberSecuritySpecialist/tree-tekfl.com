import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Phone, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { seoPages } from '../data/seoPages';
import { phoneToTel, usePublicWorkspaceSettings } from '../lib/workspaceSettings';

/** Core service landings for dropdown — matches Layout footer “Services”. */
const SERVICE_SLUGS = new Set([
  'tree-removal',
  'tree-trimming',
  'stump-grinding',
  'emergency-tree-service',
  'storm-cleanup',
  'crane-tree-work',
]);

const serviceDropdownLinks = [
  { to: '/services', label: 'All services' },
  ...seoPages
    .filter((p) => SERVICE_SLUGS.has(p.slug))
    .map((p) => ({ to: `/${p.slug}`, label: p.h1 })),
];

const mainNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/past-work', label: 'Past Work' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

function NavLink({
  to,
  label,
  onClick,
  className,
}: {
  to: string;
  label: string;
  onClick?: () => void;
  className: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={className}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const telHref = `tel:${phoneToTel(phone)}`;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const useGlassTop = isHomeRoute && !scrolled && !mobileMenuOpen;

  const desktopNavLinkClass = useGlassTop
    ? 'text-white/95 hover:text-white font-medium text-[15px] transition-colors py-2 lg:py-0'
    : 'text-gray-800 hover:text-emerald-700 font-medium text-[15px] transition-colors py-2 lg:py-0';

  const desktopPhoneClass = useGlassTop
    ? 'text-sm xl:text-[15px] font-semibold text-white/95 hover:text-white whitespace-nowrap transition-colors'
    : 'text-sm xl:text-[15px] font-semibold text-gray-800 hover:text-emerald-700 whitespace-nowrap transition-colors';

  const desktopServicesButtonClass = useGlassTop
    ? 'inline-flex items-center gap-1 text-white/95 hover:text-white font-medium text-[15px] transition-colors py-1'
    : 'inline-flex items-center gap-1 text-gray-800 hover:text-emerald-700 font-medium text-[15px] transition-colors py-1';

  const desktopCtaClass = useGlassTop
    ? 'inline-flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold px-5 py-2 shadow-sm transition-all duration-300 ease-in-out hover:bg-white/30 hover:scale-[1.03]'
    : 'inline-flex items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.03]';

  const mobileHamburgerClass = useGlassTop
    ? 'lg:hidden p-2 text-white hover:bg-white/10 rounded-lg shrink-0 z-10 transition-all duration-300 ease-in-out'
    : 'lg:hidden p-2 text-gray-800 hover:bg-gray-50 rounded-lg shrink-0 z-10 transition-all duration-300 ease-in-out';

  const mobileMiniCtaClass = useGlassTop
    ? 'lg:hidden inline-flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-all duration-300 ease-in-out hover:bg-white/30 hover:scale-[1.03]'
    : 'lg:hidden inline-flex items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-1.5 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.03]';

  const navbarShellClass = useGlassTop
    ? 'fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 transition-all duration-300 ease-in-out'
    : 'fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl shadow-lg border-b border-emerald-900/10 transition-all duration-300 ease-in-out';

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setDesktopServicesOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setDesktopServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={navbarShellClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative flex ${useGlassTop ? 'h-16' : 'h-14'} items-center justify-between gap-3 transition-all duration-300 ease-in-out`}>
            <Link to="/" className="flex items-center shrink-0 z-10">
              <img
                src="/treetek-logo.png"
                alt="TREE TEK - Complete Tree Services & Stump Grinding"
                className={`w-auto object-contain transition-all duration-300 ease-in-out ${useGlassTop ? 'h-10' : 'h-9'}`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </Link>

            <nav
              className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 xl:gap-8"
              aria-label="Primary"
            >
              <NavLink to="/" label="Home" className={desktopNavLinkClass} />
              <div className="relative" ref={servicesRef}>
                <button
                  type="button"
                  aria-expanded={desktopServicesOpen}
                  aria-haspopup="true"
                  className={desktopServicesButtonClass}
                  onClick={() => setDesktopServicesOpen((o) => !o)}
                  onMouseEnter={() => setDesktopServicesOpen(true)}
                >
                  Services
                  <ChevronDown className={`w-4 h-4 transition-transform ${desktopServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {desktopServicesOpen ? (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2 min-w-[260px] z-50"
                    onMouseLeave={() => setDesktopServicesOpen(false)}
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                      {serviceDropdownLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                          onClick={() => setDesktopServicesOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {mainNavLinks.slice(1).map((link) => (
                <NavLink key={link.to} to={link.to} label={link.label} className={desktopNavLinkClass} />
              ))}
            </nav>

            <div className="hidden lg:flex items-center justify-end gap-3 xl:gap-4 shrink-0 z-10">
              <a
                href={telHref}
                className={desktopPhoneClass}
              >
                {phone}
              </a>
              <Link
                to="/quote"
                className={desktopCtaClass}
              >
                {ctaText}
              </Link>
            </div>

            <div className="lg:hidden flex items-center gap-2 shrink-0 z-10">
              <Link to="/quote" className={mobileMiniCtaClass}>
                Quote
              </Link>
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className={mobileHamburgerClass}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        className={`lg:hidden fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
            <img
              src="/treetek-logo.png"
              alt="TREE TEK"
              className="h-10 w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="p-2 text-gray-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
          <Link
            to="/"
            className="block py-3 text-lg font-medium text-gray-900 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <div className="border-b border-gray-100 py-1">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-lg font-medium text-gray-900"
              onClick={() => setMobileServicesOpen((o) => !o)}
            >
              Services
              <ChevronDown className={`w-5 h-5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileServicesOpen ? (
              <div className="pb-3 pl-2 space-y-1 border-l-2 border-emerald-100 ml-1">
                {serviceDropdownLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block py-2.5 text-base text-gray-700 hover:text-emerald-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {mainNavLinks.slice(1).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-3 text-lg font-medium text-gray-900 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gray-50/80">
          <Link
            to="/quote"
            className="flex w-full items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-4 text-lg shadow-md transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {ctaText}
          </Link>
          <a
            href={telHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-4 text-lg font-semibold text-gray-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Phone className="w-5 h-5 text-emerald-700" />
            {phone}
          </a>
        </div>
      </nav>
    </>
  );
}
