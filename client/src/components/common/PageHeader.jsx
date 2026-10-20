import { cn } from '../../lib/cn.js';

export const BANNER_TONES = {
  brand: ['#1e1b4b', '#3730a3', '#7c3aed'],
  cyan: ['#082f49', '#0e7490', '#4f46e5'],
  emerald: ['#022c22', '#047857', '#0e7490'],
  amber: ['#451a03', '#b45309', '#be185d'],
  rose: ['#4c0519', '#be123c', '#7c3aed'],
};

/**
 * Page title block. Pass `icon` to get the gradient banner; `children` renders extra content
 * (search, stats) inside the banner. Without an icon it falls back to the plain heading.
 * `compact` trims the banner for form-heavy screens so the fields stay near the top of the viewport.
 */
export default function PageHeader({ title, description, actions, icon: Icon, tone = 'brand', compact = false, eyebrow, children }) {
  if (!Icon) {
    return (
      <div className="page-header mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-base">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    );
  }

  const [g1, g2, g3] = BANNER_TONES[tone] ?? BANNER_TONES.brand;
  return (
    <div className={cn('page-banner mb-8', compact && 'is-compact')} style={{ '--g1': g1, '--g2': g2, '--g3': g3 }}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="banner-icon"><Icon className="h-6 w-6" aria-hidden="true" /></span>
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-white/70">{eyebrow}</p>}
            <h1 className={compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}>{title}</h1>
            {description && <p className={cn('max-w-2xl text-base', compact ? 'mt-1' : 'mt-2')}>{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
