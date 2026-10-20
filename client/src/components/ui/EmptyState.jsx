import { cn } from '../../lib/cn.js';

const tones = {
  brand: 'text-brand-600',
  danger: 'is-danger text-rose-600',
};

/** An empty screen is an invitation to act: say what's missing and offer the next step. */
export default function EmptyState({ icon: Icon, title, description, action, tone = 'brand', as: Heading = 'h2', className }) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center', className)}>
      {Icon && (
        <span className={cn('empty-state-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border bg-white', tones[tone])}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <Heading className="text-xl font-bold">{title}</Heading>
      {description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
