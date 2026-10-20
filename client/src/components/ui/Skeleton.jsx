import { cn } from '../../lib/cn.js';

export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('skeleton', className)} />;
}
