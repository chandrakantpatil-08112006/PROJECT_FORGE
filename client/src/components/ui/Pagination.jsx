import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/** 1 … 4 [5] 6 … 20 : always shows first, last and the neighbours of the current page. */
function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) items.push('gap');
    items.push(p);
  });
  return items;
}

const itemStyles = 'inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-all duration-200';

export default function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(itemStyles, 'border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-45')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pageWindow(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-slate-400" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              itemStyles,
              item === page ? 'border-transparent bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30' : 'border-line bg-white text-slate-600 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(itemStyles, 'border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-45')}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
