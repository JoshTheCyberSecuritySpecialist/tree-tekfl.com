import { useCallback, useEffect, useState, DragEvent, ChangeEvent } from 'react';
import { Copy, Trash2, ImageIcon, Upload } from 'lucide-react';
import {
  deleteMediaLibraryObject,
  listMediaLibraryImages,
  uploadMediaLibraryImage,
  type MediaLibraryItem,
} from '../../lib/mediaLibrary';

export default function MediaTab() {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [preview, setPreview] = useState<MediaLibraryItem | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
    load();
  }, [load]);

  useEffect(() => {
    if (!banner || banner.type !== 'ok') return;
    const t = window.setTimeout(() => setBanner(null), 2600);
    return () => window.clearTimeout(t);
  }, [banner]);

  const runUpload = async (file: File) => {
    setBanner(null);
    setUploading(true);
    setUploadPct(15);
    const tick = window.setInterval(() => {
      setUploadPct((p) => (p < 90 ? p + 12 : p));
    }, 160);
    try {
      await uploadMediaLibraryImage(file);
      setUploadPct(100);
      setBanner({ type: 'ok', text: 'Upload complete.' });
      await load();
    } catch (e) {
      setBanner({ type: 'err', text: e instanceof Error ? e.message : 'Upload failed' });
    } finally {
      window.clearInterval(tick);
      setUploading(false);
      setUploadPct(0);
    }
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void runUpload(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void runUpload(file);
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setBanner({ type: 'ok', text: 'URL copied.' });
    } catch {
      setBanner({ type: 'err', text: 'Clipboard unavailable.' });
    }
  };

  const onDelete = async (it: MediaLibraryItem) => {
    if (!confirm(`Delete “${it.name}” from storage? This cannot be undone.`)) return;
    try {
      await deleteMediaLibraryObject(it.path);
      setItems((prev) => prev.filter((x) => x.path !== it.path));
      if (preview?.path === it.path) setPreview(null);
      setBanner({ type: 'ok', text: 'File deleted.' });
    } catch (e) {
      setBanner({ type: 'err', text: e instanceof Error ? e.message : 'Delete failed' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading media…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm space-y-3">
        <p className="font-semibold">Could not load media library</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs">
          Apply the migration that creates the <code className="bg-white/60 px-1 rounded">media</code> bucket, then reload.
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
    <div className="space-y-5">
      {banner ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            banner.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {banner.text}
          {banner.type === 'err' ? (
            <button type="button" className="ml-3 underline" onClick={() => setBanner(null)}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition shadow-sm bg-white ${
          dragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200'
        }`}
      >
        <Upload className="h-10 w-10 mx-auto text-emerald-700 mb-3" aria-hidden />
        <p className="font-semibold text-gray-900 mb-1">Upload images</p>
        <p className="text-sm text-gray-600 mb-4">JPG, PNG, or WebP · up to 10MB · stored as{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">{'{timestamp}-{filename}'}</code> in bucket <code className="text-xs bg-gray-100 px-1 rounded">media</code>
        </p>
        {uploading ? (
          <div className="max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(100, uploadPct)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Uploading…</p>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-900 cursor-pointer transition">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileInput} />
            Choose file
          </label>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
          <ImageIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" aria-hidden />
          <p className="font-medium text-gray-800">No media uploaded yet</p>
          <p className="text-sm mt-1">Drop an image above or use Choose file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((it) => (
            <div
              key={it.path}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <button
                type="button"
                onClick={() => setPreview(it)}
                className="block w-full aspect-square bg-gray-100 relative"
              >
                <img src={it.publicUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
              <div className="p-3 space-y-2">
                <p className="text-xs font-mono text-gray-600 truncate" title={it.name}>
                  {it.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(it.publicUrl)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(it)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 text-red-800 px-2.5 py-1.5 text-xs font-semibold hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-2 mb-3">
              <p className="text-sm font-mono text-gray-600 break-all">{preview.name}</p>
              <button type="button" className="text-gray-500 hover:text-gray-800 text-sm font-semibold" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <img src={preview.publicUrl} alt="" className="w-full max-h-[60vh] object-contain rounded-xl border border-gray-100 bg-gray-50" />
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => copyUrl(preview.publicUrl)}
                className="rounded-xl bg-emerald-800 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-900"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => onDelete(preview)}
                className="rounded-xl border border-red-200 text-red-800 px-4 py-2 text-sm font-semibold hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
