import StatusBadge from './StatusBadge';

export type AdminProjectRow = {
  id: string;
  title: string;
  category: string;
  location: string | null;
  media_type: 'image' | 'video';
  url: string;
  video_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
};

type Props = {
  project: AdminProjectRow;
  onEdit: (project: AdminProjectRow) => void;
  onDelete: (project: AdminProjectRow) => void;
  onToggleFeatured: (project: AdminProjectRow) => void;
  onTogglePublished: (project: AdminProjectRow) => void;
};

export default function ProjectRow({
  project,
  onEdit,
  onDelete,
  onToggleFeatured,
  onTogglePublished,
}: Props) {
  const mediaSrc = project.media_type === 'video' ? project.video_url || project.url : project.url;
  const missingMedia = !mediaSrc;

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3">
        <div className="w-16 h-12 rounded-md bg-gray-100 overflow-hidden">
          {mediaSrc && project.media_type === 'video' ? (
            <video src={mediaSrc} className="w-full h-full object-cover" muted loop playsInline />
          ) : mediaSrc ? (
            <img src={mediaSrc} alt={project.title} className="w-full h-full object-cover" />
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-gray-900">{project.title}</td>
      <td className="px-4 py-3 text-gray-700">{project.category}</td>
      <td className="px-4 py-3 text-gray-700">{project.location || '—'}</td>
      <td className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500">{project.media_type}</td>
      <td className="px-4 py-3">
        <StatusBadge published={project.is_published} missingMedia={missingMedia} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onToggleFeatured(project)}
          className={`rounded px-2.5 py-1 text-sm font-semibold ${
            project.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {project.is_featured ? '★' : '☆'}
        </button>
      </td>
      <td className="px-4 py-3 text-gray-700">{project.display_order ?? 0}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onEdit(project)} className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs font-semibold">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(project)} className="px-3 py-1.5 rounded bg-red-600 text-white text-xs font-semibold">
            Delete
          </button>
          <button type="button" onClick={() => onTogglePublished(project)} className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
            {project.is_published ? 'Hide' : 'Publish'}
          </button>
        </div>
      </td>
    </tr>
  );
}
