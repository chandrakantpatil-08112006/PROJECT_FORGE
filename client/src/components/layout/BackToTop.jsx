import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn.js';

/** Floating button that appears after the page has been scrolled a while. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn('back-top', visible && 'is-visible')}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
