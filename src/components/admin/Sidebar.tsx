type ModuleKey =
  | 'dashboard'
  | 'pastwork'
  | 'quotes'
  | 'leads'
  | 'reviews'
  | 'media'
  | 'pages'
  | 'settings'
  | 'blog'
  | 'faq';

type Props = {
  active: ModuleKey;
  onChange: (module: ModuleKey) => void;
};

const modules: { key: ModuleKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pastwork', label: 'Past Work' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'leads', label: 'Leads' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'media', label: 'Media' },
  { key: 'pages', label: 'Pages' },
  { key: 'settings', label: 'Settings' },
  { key: 'blog', label: 'Blog' },
  { key: 'faq', label: 'FAQ' },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 px-2 py-1">Admin Modules</p>
      <nav className="mt-1 space-y-1">
        {modules.map((module) => (
          <button
            key={module.key}
            type="button"
            onClick={() => onChange(module.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              active === module.key
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            } ${module.key === 'pastwork' ? 'font-semibold' : ''}`}
          >
            {module.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
