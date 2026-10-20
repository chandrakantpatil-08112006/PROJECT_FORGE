import { LogoMark } from '../layout/Logo.jsx';

export default function FullPageLoader({ label = 'Loading' }) {
  return (
    <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
      <span className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 rounded-2xl bg-brand-500/20 motion-safe:animate-ping" aria-hidden="true" />
        <LogoMark className="relative h-12 w-12 motion-safe:animate-[bob_2.4s_ease-in-out_infinite]" />
      </span>
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}
