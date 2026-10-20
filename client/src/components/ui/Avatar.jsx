import { useState } from 'react';
import { cn } from '../../lib/cn.js';
import { initials } from '../../lib/formatters.js';

const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-24 w-24 text-2xl' };

// A small, fixed palette so the same person always gets the same colour.
const palettes = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-fuchsia-500 to-purple-500',
];
const paletteFor = (name = '') => palettes[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length];

/** Profile picture, falling back to initials when there is no URL or it fails to load. */
export default function Avatar({ name, src, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white',
        !showImage && 'bg-gradient-to-br',
        !showImage && paletteFor(name),
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{initials(name) || '?'}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
