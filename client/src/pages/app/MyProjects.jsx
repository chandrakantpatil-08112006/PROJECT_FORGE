import { FolderKanban, FolderPlus, FolderSearch, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader.jsx';
import ProjectCard, { ProjectCardSkeleton } from '../../components/common/ProjectCard.jsx';
import Button, { LinkButton } from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Tabs, { panelId, tabId } from '../../components/ui/Tabs.jsx';
import {
  useChangeProjectStatusMutation,
  useMyProjectsQuery,
  usePublishProjectMutation,
} from '../../features/projects/projectsApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { pluralize } from '../../lib/formatters.js';

const RELATIONS = [
  { value: 'owned', label: 'Created by me', icon: FolderKanban },
  { value: 'joined', label: "I've joined", icon: Users },
];

// Accent colours only; the values are what the API filters on.
const STATUS_FILTERS = [
  { value: 'all', label: 'All (not archived)', a: '#4f46e5', b: '#7c3aed' },
  { value: 'draft', label: 'Drafts', a: '#64748b', b: '#94a3b8' },
  { value: 'recruiting', label: 'Recruiting', a: '#059669', b: '#10b981' },
  { value: 'in_progress', label: 'In progress', a: '#4338ca', b: '#6366f1' },
  { value: 'completed', label: 'Completed', a: '#0e7490', b: '#06b6d4' },
  { value: 'archived', label: 'Archived', a: '#b45309', b: '#f59e0b' },
];

function OwnerActions({ project }) {
  const [publish, { isLoading: publishing }] = usePublishProjectMutation();
  const [changeStatus, { isLoading: restoring }] = useChangeProjectStatusMutation();

  const run = async (action, message) => {
    try {
      await action.unwrap();
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {project.status !== 'archived' && (
        <LinkButton to={`/projects/${project.id}/edit`} variant="secondary" size="sm">Edit</LinkButton>
      )}
      {project.status === 'draft' && (
        <Button size="sm" loading={publishing} onClick={() => run(publish(project.id), 'Project published')}>Publish</Button>
      )}
      {project.status === 'archived' && (
        <Button size="sm" variant="secondary" loading={restoring} onClick={() => run(changeStatus({ id: project.id, status: 'draft' }), 'Project restored as a draft')}>
          Restore
        </Button>
      )}
    </>
  );
}

export default function MyProjects() {
  useDocumentTitle('My projects');
  const [relation, setRelation] = useState('owned');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isFetching, refetch } = useMyProjectsQuery({ relation, status, page, limit: 12 });

  const projects = data?.items ?? [];

  return (
    <>
      <PageHeader
        icon={FolderKanban}
        tone="cyan"
        title="My projects"
        description="Projects you created or joined."
        actions={<LinkButton to="/projects/new" variant="plain" className="hero-cta"><Plus className="h-4 w-4" aria-hidden="true" /> New project</LinkButton>}
      />

      <div className="mb-6 space-y-4">
        <Tabs
          prefix="mine"
          label="Show projects"
          value={relation}
          tabs={RELATIONS}
          onChange={(value) => { setRelation(value); setPage(1); }}
        />
        <div className="chip-scroll -mx-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="cat-chip"
              style={{ '--a': item.a, '--b': item.b }}
              aria-pressed={status === item.value}
              onClick={() => { setStatus(item.value); setPage(1); }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {data && !error && <p className="text-sm font-semibold text-slate-600" aria-live="polite">{data.meta.total === 0 ? 'No projects' : pluralize(data.meta.total, 'project')}</p>}
      </div>

      <div id={panelId('mine')} role="tabpanel" aria-labelledby={tabId('mine', relation)} tabIndex={-1} className="outline-none">
        <h2 className="sr-only">{relation === 'owned' ? 'Projects you created' : 'Projects you joined'}</h2>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <ProjectCardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} title="Your projects couldn't be loaded" />
        ) : projects.length === 0 ? (
          relation === 'owned' ? (
            <EmptyState
              icon={FolderPlus}
              title={status === 'all' ? "You haven't created a project yet" : 'No projects with this status'}
              description={status === 'all' ? 'Describe your idea, list the roles you need and publish it.' : 'Try another status filter.'}
              action={status === 'all' && <LinkButton to="/projects/new">Create a project</LinkButton>}
            />
          ) : (
            <EmptyState
              icon={FolderSearch}
              title="You haven't joined a project yet"
              description="When an owner accepts you onto a team, the project shows up here."
              action={<LinkButton to="/explore">Explore projects</LinkButton>}
            />
          )
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showStatus
                  footer={relation === 'owned' ? <OwnerActions project={project} /> : undefined}
                />
              ))}
            </div>
            <Pagination className="mt-8" page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </>
  );
}
