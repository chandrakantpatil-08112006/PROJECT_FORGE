import { CircleAlert, RotateCw } from 'lucide-react';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';

/** `error` is the normalised { message, status } object from the API layer. */
export default function ErrorState({ error, onRetry, title = "We couldn't load this" }) {
  return (
    <EmptyState
      icon={CircleAlert}
      tone="danger"
      title={title}
      description={error?.message ?? 'Something went wrong. Please try again.'}
      action={onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
        </Button>
      )}
    />
  );
}
