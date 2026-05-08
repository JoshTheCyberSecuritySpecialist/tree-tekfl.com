import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'white' | 'gray';
}

export default function Card({ children, className = '', variant = 'white' }: CardProps) {
  const baseClass = variant === 'glass'
    ? 'glass p-5 md:p-6'
    : variant === 'gray'
    ? 'bg-emerald-50/60 rounded-2xl border border-[#DDE8E3] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow'
    : 'bg-white rounded-2xl border border-[#DDE8E3] p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow';

  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
