import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { listMediaLibraryImages, type MediaLibraryItem } from '../../lib/mediaLibrary';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (publicUrl: string) => void;
  title?: string;
};

export default function MediaLibraryPicker({ open, onClose, onSelect, title = 'Choose from media library' }: Props) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listMediaLibraryImages(100);
      setItems(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] w-full max-w-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
              <p className="mt-2 text-xs">
                Ensure the <code className="bg-white/70 px-1 rounded">media</code> bucket migration is applied.
              </p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-600 py-10 text-sm">No images in the library yet. Upload some in Admin → Media.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((it) => (
                <button
                  key={it.path}
                  type="button"
                  onClick={() => {
                    onSelect(it.publicUrl);
                    onClose();
                  }}
                  className="group rounded-xl border border-gray-200 overflow-hidden text-left hover:border-emerald-400 hover:shadow-md transition bg-white"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img src={it.publicUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="p-2 text-[11px] text-gray-600 truncate font-mono">{it.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
