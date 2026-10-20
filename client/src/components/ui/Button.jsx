import { Link } from 'react-router';
import { cn } from '../../lib/cn.js';
import Spinner from './Spinner.jsx';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-800',
  danger: 'btn-danger',
  'danger-outline': 'border border-rose-200 bg-white text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50',
  // No built-in look: for buttons that bring their own surface (e.g. .hero-cta / .hero-ghost on dark banners).
  plain: '',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/** Class string for anything that should look like a button (e.g. a router <Link>). */
export const buttonStyles = ({ variant = 'primary', size = 'md', className } = {}) =>
  cn(base, variants[variant], sizes[size], className);

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function LinkButton({ to, variant, size, className, children, ...props }) {
  return (
    <Link to={to} className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
