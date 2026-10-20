import { cn } from '../../lib/cn.js';

const tones = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
