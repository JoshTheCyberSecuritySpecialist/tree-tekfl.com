import Card from '../Card';

type Props = {
  title: string;
  description: string;
  bullets?: string[];
};

export default function AdminModulePlaceholder({ title, description, bullets }: Props) {
  return (
    <Card className="p-6 md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Coming soon</p>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
        {bullets && bullets.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
