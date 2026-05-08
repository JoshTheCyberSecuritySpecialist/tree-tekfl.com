import ProjectRow, { AdminProjectRow } from './ProjectRow';

type Props = {
  rows: AdminProjectRow[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (project: AdminProjectRow) => void;
  onDelete: (project: AdminProjectRow) => void;
  onToggleFeatured: (project: AdminProjectRow) => void;
  onTogglePublished: (project: AdminProjectRow) => void;
};

export default function ProjectTable({
  rows,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onToggleFeatured,
  onTogglePublished,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedRows = rows.slice(start, start + pageSize);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Project Title</th>
              <th className="text-left px-4 py-3">Service</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Featured</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFeatured={onToggleFeatured}
                onTogglePublished={onTogglePublished}
              />
            ))}
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No projects found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-xs text-gray-600">
        <span>
          Showing {rows.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
