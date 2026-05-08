export type ProjectFormState = {
  title: string;
  category: string;
  location: string;
  caption: string;
  media_type: 'image' | 'video';
  url: string;
  video_url: string;
  before_url: string;
  after_url: string;
  alt: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  has_google_review_overlay: boolean;
};

type UploadKind = 'primary' | 'before' | 'after' | 'video';

type Props = {
  value: ProjectFormState;
  previewUrl: string;
  saving: boolean;
  uploadingMedia: UploadKind | null;
  notice: { type: 'success' | 'error'; message: string } | null;
  onChange: (next: ProjectFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onUpload: (kind: UploadKind, file?: File) => void;
  /** Open shared Media Library picker (images only) for this slot. */
  onOpenMediaLibrary?: (kind: UploadKind) => void;
  isEdit: boolean;
};

export default function ProjectForm({
  value,
  previewUrl,
  saving,
  uploadingMedia,
  notice,
  onChange,
  onSubmit,
  onCancel,
  onUpload,
  onOpenMediaLibrary,
  isEdit,
}: Props) {
  const set = <K extends keyof ProjectFormState>(key: K, next: ProjectFormState[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 h-fit">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{isEdit ? 'Edit Project' : 'Create Project'}</h3>

      {notice ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm mb-3 ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="space-y-3">
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Project Title" value={value.title} onChange={(e) => set('title', e.target.value)} />
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Service Type" value={value.category} onChange={(e) => set('category', e.target.value)} />
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Location" value={value.location} onChange={(e) => set('location', e.target.value)} />
        <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Short Caption" value={value.caption} onChange={(e) => set('caption', e.target.value)} />

        <select className="w-full px-3 py-2 border rounded-lg" value={value.media_type} onChange={(e) => set('media_type', e.target.value as 'image' | 'video')}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Primary Image Upload</label>
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" disabled={saving || uploadingMedia !== null} onChange={(e) => onUpload('primary', e.target.files?.[0])} className="w-full text-sm" />
          <div className="flex flex-wrap gap-2 mt-2">
            <input className="flex-1 min-w-[8rem] px-3 py-2 border rounded-lg" placeholder="Primary Image URL" value={value.url} onChange={(e) => set('url', e.target.value)} />
            {onOpenMediaLibrary && value.media_type === 'image' ? (
              <button
                type="button"
                disabled={saving || uploadingMedia !== null}
                onClick={() => onOpenMediaLibrary('primary')}
                className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
              >
                Media library
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Video Upload (optional)</label>
          <input type="file" accept="video/mp4,video/quicktime,video/webm" disabled={saving || uploadingMedia !== null} onChange={(e) => onUpload('video', e.target.files?.[0])} className="w-full text-sm" />
          <input className="w-full mt-2 px-3 py-2 border rounded-lg" placeholder="Video URL" value={value.video_url} onChange={(e) => set('video_url', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Before Image</label>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" disabled={saving || uploadingMedia !== null} onChange={(e) => onUpload('before', e.target.files?.[0])} className="w-full text-sm" />
            <div className="flex flex-wrap gap-2 mt-2">
              <input className="flex-1 min-w-[6rem] px-3 py-2 border rounded-lg" placeholder="Before URL" value={value.before_url} onChange={(e) => set('before_url', e.target.value)} />
              {onOpenMediaLibrary ? (
                <button
                  type="button"
                  disabled={saving || uploadingMedia !== null}
                  onClick={() => onOpenMediaLibrary('before')}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
                >
                  Library
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">After Image</label>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" disabled={saving || uploadingMedia !== null} onChange={(e) => onUpload('after', e.target.files?.[0])} className="w-full text-sm" />
            <div className="flex flex-wrap gap-2 mt-2">
              <input className="flex-1 min-w-[6rem] px-3 py-2 border rounded-lg" placeholder="After URL" value={value.after_url} onChange={(e) => set('after_url', e.target.value)} />
              {onOpenMediaLibrary ? (
                <button
                  type="button"
                  disabled={saving || uploadingMedia !== null}
                  onClick={() => onOpenMediaLibrary('after')}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
                >
                  Library
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Alt text" value={value.alt} onChange={(e) => set('alt', e.target.value)} />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={value.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={value.is_published} onChange={(e) => set('is_published', e.target.checked)} /> Published</label>
          <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={value.has_google_review_overlay} onChange={(e) => set('has_google_review_overlay', e.target.checked)} /> Google Review Overlay</label>
        </div>

        <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="Display Order" value={value.display_order} onChange={(e) => set('display_order', Number(e.target.value) || 0)} />

        {(previewUrl || value.video_url || value.url) ? (
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {value.media_type === 'video' ? (
              <video src={previewUrl || value.video_url || value.url} className="w-full h-40 object-cover" autoPlay muted loop playsInline />
            ) : (
              <img src={previewUrl || value.url} alt="Preview" className="w-full h-40 object-cover" />
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || uploadingMedia !== null}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </aside>
  );
}
