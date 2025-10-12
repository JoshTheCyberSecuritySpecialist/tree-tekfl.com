import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'white' | 'gray';
}

export default function Section({ children, className = '', variant = 'default' }: SectionProps) {
  const bgClass = variant === 'white' ? 'bg-white' : variant === 'gray' ? 'bg-gray-50' : 'bg-section';

  return (
    <section className={`${bgClass} ${className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {children}
      </div>
    </section>
  );
}
