import { useMemo } from 'react';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const json = useMemo(() => JSON.stringify(data), [data]);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
