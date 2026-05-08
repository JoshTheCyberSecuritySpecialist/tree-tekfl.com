type Props = {
  published: boolean;
  missingMedia?: boolean;
};

export default function StatusBadge({ published, missingMedia = false }: Props) {
  if (missingMedia) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        Missing media
      </span>
    );
  }

  return published ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700">
      Hidden
    </span>
  );
}
