import { Check } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * A radio group drawn as selectable tiles. It is a real set of radio inputs, so keyboard, screen readers
 * and react-hook-form all work unchanged: spread `{...register('field')}` onto it.
 * Pass `value` to control it yourself; leave it out when react-hook-form owns the state.
 * Options: { value, label, note?, icon?, a?, b? } where a/b are the tile's accent colours.
 */
export default function ChoiceGroup({ legend, hint, error, required, options, name, value, onChange, onBlur, ref, columns = 'grid-cols-2 sm:grid-cols-3', className }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <fieldset className={cn('min-w-0', className)} aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-slate-800">
        {legend}
        {required && <span className="ml-0.5 text-rose-600" aria-hidden="true">*</span>}
      </legend>
      <div className={cn('grid gap-2', columns)}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <label key={option.value} className="block">
              <input
                type="radio"
                className="choice-input sr-only"
                name={name}
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
              />
              <span className="choice-tile" style={{ '--a': option.a ?? '#4f46e5', '--b': option.b ?? '#7c3aed' }}>
                {Icon && <span className="choice-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{option.label}</span>
                  {option.note && <span className="block truncate text-xs text-slate-600">{option.note}</span>}
                </span>
                <Check className="choice-check h-4 w-4 shrink-0" aria-hidden="true" />
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-rose-700">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">{hint}</p>
      )}
    </fieldset>
  );
}
