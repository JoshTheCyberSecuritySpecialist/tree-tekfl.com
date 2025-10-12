import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 border border-white/20 text-emerald-50 text-sm ${className}`}>
      {children}
    </span>
  );
}
