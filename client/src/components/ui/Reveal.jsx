import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn.js';

/** Fades its children in the first time they scroll into view. Content is simply shown when motion is reduced. */
export default function Reveal({ as: Tag = 'div', delay = 0, className, children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn('reveal', visible && 'is-visible', className)} style={{ '--reveal-delay': `${delay}ms` }} {...props}>
      {children}
    </Tag>
  );
}
