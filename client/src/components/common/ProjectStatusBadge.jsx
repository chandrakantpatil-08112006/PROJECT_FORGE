import { PROJECT_STATUSES } from '../../lib/constants.js';

export default function ProjectStatusBadge({ status }) {
  const config = PROJECT_STATUSES[status] ?? { label: status, tone: 'neutral' };
  return (
    <span className={`badge status-badge status-${status} inline-flex items-center text-xs`}>
      <span className="status-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
