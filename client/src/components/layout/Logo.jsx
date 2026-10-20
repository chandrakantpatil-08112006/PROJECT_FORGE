import { useId } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn.js';

export function LogoMark({ className = 'h-7 w-7' }) {
  const gradientId = `projectforge-mark-${useId().replaceAll(':', '')}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill={`url(#${gradientId})`} />
      <path d="M9 8h9a5 5 0 0 1 0 10h-4v6H9z" fill="#fff" />
      <circle cx="14" cy="13" r="1.8" fill="#4f46e5" />
    </svg>
  );
}

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="brand-lockup inline-flex items-center gap-2 rounded-lg sm:gap-2.5">
      <LogoMark className="brand-mark h-8 w-8 sm:h-9 sm:w-9" />
      <span className={cn('font-display text-base font-extrabold tracking-tight sm:text-lg', light ? 'text-white' : 'text-ink')}>ProjectForge</span>
    </Link>
  );
}
