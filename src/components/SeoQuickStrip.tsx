import { Link, useLocation } from 'react-router-dom';

/** Shared shortcuts — used as slim bar on blog routes; full list also in Layout footer. */
export const POPULAR_LOCAL_LINKS = [
  { to: '/tree-removal', label: 'Tree removal' },
  { to: '/tree-removal-daytona-beach', label: 'Daytona Beach' },
  { to: '/stump-grinding-port-orange', label: 'Stump grinding — Port Orange' },
  { to: '/emergency-tree-service-volusia-county', label: 'Emergency — Volusia' },
  { to: '/cost-of-tree-removal-florida', label: 'Removal cost (FL)' },
  { to: '/tree-service-faq', label: 'Tree service FAQ' },
] as const;

/**
 * Slim related-links strip (Option B) — light bar, horizontal scroll on small screens.
 * Use only on blog routes from Layout; heavy dark strip removed site-wide.
 */
export default function SeoQuickStrip() {
  const location = useLocation();

  return (
    <div className="bg-gray-50/95 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0 hidden sm:inline">
            Popular:
          </span>
          <nav
            aria-label="Popular local pages"
            className="flex-1 min-w-0 overflow-x-auto scrollbar-thin pb-0.5 -mb-0.5"
          >
            <ul className="flex flex-nowrap gap-2 sm:gap-2.5 items-center">
              {POPULAR_LOCAL_LINKS.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                <li key={to} className="shrink-0">
                  <Link
                    to={to}
                    className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border shadow-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                        : 'text-gray-700 bg-white border-gray-200 hover:border-emerald-300 hover:text-emerald-800 hover:bg-emerald-50/80'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
                );
              })}
              <li className="shrink-0">
                <Link
                  to="/services"
                  className="inline-block px-3 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 whitespace-nowrap"
                >
                  All services →
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
