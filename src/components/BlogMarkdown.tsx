import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useMemo } from 'react';

const baseComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-10 mb-4 tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h4>
  ),
  p: ({ children }) => <p className="text-gray-800 leading-relaxed mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-800">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-800">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-emerald-700 font-medium underline decoration-emerald-600/50 underline-offset-[3px] hover:text-emerald-900 hover:decoration-emerald-700"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-emerald-600 pl-5 my-8 text-gray-700 bg-emerald-50/70 py-4 pr-4 rounded-r-xl">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={`${className || ''} text-sm`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-100 text-gray-900 p-4 rounded-xl overflow-x-auto text-sm my-8 border border-gray-200">
      {children}
    </pre>
  ),
  img: ({ src, alt }) => (
    <img
      src={src || ''}
      alt={alt || ''}
      className="w-full max-w-full h-auto rounded-xl shadow-md my-8 border border-gray-100"
      loading="lazy"
      decoding="async"
    />
  ),
  hr: () => <hr className="my-12 border-gray-200" />,
};

const articleComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-4 tracking-tight scroll-mt-24">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl sm:text-[1.75rem] font-bold text-emerald-800 mt-14 mb-5 pb-2 border-b border-emerald-100 tracking-tight scroll-mt-24">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3 scroll-mt-24">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold text-gray-900 mt-8 mb-3">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-800 text-[17px] leading-[1.75] mb-6 max-w-none">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-7 space-y-2 mb-8 text-[17px] leading-[1.75] text-gray-800 marker:text-emerald-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-7 space-y-2 mb-8 text-[17px] leading-[1.75] text-gray-800 marker:font-semibold marker:text-emerald-800">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed mb-2">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-gray-950">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-emerald-800 font-semibold underline decoration-emerald-400/70 underline-offset-[3px] hover:text-emerald-950 hover:decoration-emerald-700"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-emerald-600 bg-emerald-50/90 pl-6 pr-5 py-5 my-10 rounded-r-xl text-gray-800 text-[17px] leading-[1.75] shadow-sm">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={`${className || ''} text-sm`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-gray-100 text-gray-900 px-2 py-1 rounded-md text-[0.9em] font-mono" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-5 rounded-xl overflow-x-auto text-sm my-10 border border-gray-700 shadow-inner">
      {children}
    </pre>
  ),
  img: ({ src, alt }) => (
    <img
      src={src || ''}
      alt={alt || ''}
      className="w-full max-w-full h-auto rounded-xl shadow-lg my-10 border border-gray-100"
      loading="lazy"
      decoding="async"
    />
  ),
  hr: () => <hr className="my-14 border-gray-200" />,
};

interface BlogMarkdownProps {
  children: string;
  className?: string;
  /** Larger typography + accents for blog article layout */
  variant?: 'default' | 'article';
}

export default function BlogMarkdown({ children, className = '', variant = 'default' }: BlogMarkdownProps) {
  const components = useMemo(
    () => (variant === 'article' ? articleComponents : baseComponents),
    [variant],
  );

  return (
    <div className={`blog-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
