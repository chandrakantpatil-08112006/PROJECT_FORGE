import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../lib/cn.js';
import Field, { controlStyles, describedBy } from './Field.jsx';

/**
 * Works with react-hook-form's {...register('name')} because `ref` is an ordinary prop in React 19.
 * Pass `icon` (a lucide component) for a leading glyph.
 */
export default function Input({ label, hint, error, required, id, className, icon: Icon, ref, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const isPassword = props.type === 'password';
  const [visible, setVisible] = useState(false);

  const control = (
    <input
      ref={ref}
      id={inputId}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(inputId, error, hint)}
      className={cn(controlStyles(error), 'h-10', Icon && 'pl-10', isPassword && 'pr-11')}
      {...props}
      type={isPassword && visible ? 'text' : props.type}
    />
  );

  const decorated = Icon || isPassword ? (
    <div className="group relative">
      {Icon && (
        <Icon
          className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors', error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-brand-600')}
          aria-hidden="true"
        />
      )}
      {control}
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  ) : (
    control
  );

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      {decorated}
    </Field>
  );
}
