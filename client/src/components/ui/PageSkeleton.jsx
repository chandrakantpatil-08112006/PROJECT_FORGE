import Skeleton from './Skeleton.jsx';

/** Layout-shaped placeholder shown while a lazily loaded page downloads, so the shell never goes blank. */
export default function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <Skeleton className="h-40 w-full rounded-3xl sm:h-48" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-56 rounded-2xl" />)}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
