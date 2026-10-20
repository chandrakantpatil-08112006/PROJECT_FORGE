import { useEffect, useState } from 'react';

/** Animates a number from 0 to `value`. Jumps straight to the value when the user prefers reduced motion. */
export function useCountUp(value, duration = 900) {
  const target = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return shown;
}
