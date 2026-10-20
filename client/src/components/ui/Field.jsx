import { cn } from '../../lib/cn.js';

/** Label + control slot + hint/error text. Shared by Input, Textarea, Select and custom controls. */
export default function Field({ id, label, hint, error, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-rose-600" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-rose-700 motion-safe:animate-[card-enter_.3s_var(--ease)_both]">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const controlStyles = (error) =>
  cn(
    'block w-full rounded-xl border bg-white px-3.5 text-sm text-ink shadow-sm shadow-slate-900/[0.03] placeholder:text-slate-400',
    'transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4',
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
    error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
      : 'border-line hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/15',
  );

export const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
