import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import JsonLd from '../components/JsonLd';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function Faq() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const faqSchema = useMemo(() => {
    if (items.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    async function loadFaqs() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('faq_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (import.meta.env.DEV) {
        console.log('FAQ DATA:', data);
        console.log('FAQ ERROR:', queryError);
      }

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems((data as FaqItem[]) || []);
      setLoading(false);
    }

    loadFaqs();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <SEO
          title="FAQ — Tree Services, Quotes & Scheduling | TREE TEK"
          description="Answers about TREE TEK tree removal, stump grinding, quotes, and service areas in Volusia County."
          path="/faq"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-8">Quick answers about our services, scheduling, and quotes.</p>
        <p className="text-gray-700">Loading FAQs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <SEO
          title="FAQ — TREE TEK"
          description="TREE TEK frequently asked questions about tree services in Volusia County."
          path="/faq"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-8">Quick answers about our services, scheduling, and quotes.</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Could not load FAQs</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SEO
        title="FAQ — Tree Services, Quotes & Scheduling | TREE TEK"
        description="Answers about TREE TEK tree removal, stump grinding, emergency response, and quotes in Port Orange, Daytona Beach, and Volusia County."
        path="/faq"
      />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-8">Quick answers about our services, scheduling, and quotes.</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-gray-600">No FAQs available yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isOpen = openItemId === item.id;
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setOpenItemId((prev) => {
                      if (prev === item.id) return null;
                      return item.id;
                    })
                  }
                  className="w-full text-left px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center gap-4"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="text-emerald-700 text-xl leading-none shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-6 pb-5 text-gray-700 whitespace-pre-wrap border-t border-gray-100 pt-4">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
