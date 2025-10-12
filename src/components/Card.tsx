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
    ? 'bg-gray-50 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow'
    : 'bg-white rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow';

  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
