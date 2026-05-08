type Props = {
  total: number;
  featured: number;
  published: number;
  hidden: number;
  missingMedia: number;
};

export default function StatsCards({ total, featured, published, hidden, missingMedia }: Props) {
  const cards = [
    { label: 'Total Projects', value: total, tone: 'text-gray-900' },
    { label: 'Featured', value: featured, tone: 'text-emerald-700' },
    { label: 'Published', value: published, tone: 'text-emerald-700' },
    { label: 'Hidden', value: hidden, tone: 'text-gray-600' },
    { label: 'Missing Media', value: missingMedia, tone: 'text-amber-700' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
