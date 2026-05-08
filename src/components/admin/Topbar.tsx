import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
  onLogout: () => void;
};

export default function Topbar({ title, subtitle, userEmail, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = userEmail?.trim()?.charAt(0)?.toUpperCase() || '?';
  const displayEmail = userEmail?.trim() || 'Signed in';

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle ? <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p> : null}
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 hover:bg-gray-50 transition"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
            {initial}
          </span>
          <span className="hidden sm:flex flex-col items-start text-left max-w-[160px]">
            <span className="text-xs font-semibold text-gray-900 truncate w-full">Account</span>
            <span className="text-[11px] text-gray-500 truncate w-full">{displayEmail}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-50"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Signed in as
              </p>
              <p className="text-sm font-medium text-gray-900 break-all mt-0.5">{displayEmail}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
