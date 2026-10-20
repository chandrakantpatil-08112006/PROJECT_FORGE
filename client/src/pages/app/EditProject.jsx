import { Pencil, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LinkButton } from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ProjectForm from '../../features/projects/components/ProjectForm.jsx';
import { useProject } from '../../features/projects/hooks.js';
import { useUpdateProjectMutation } from '../../features/projects/projectsApi.js';
import { projectToFormValues } from '../../features/projects/schemas.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, error, isLoading, refetch } = useProject(id);
  const [updateProject] = useUpdateProjectMutation();
  useDocumentTitle(project ? `Edit ${project.title}` : 'Edit project');

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading project" className="space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <div className="grid gap-8 lg:grid-cols-[1fr_21.5rem]">
          <div className="space-y-6"><Skeleton className="h-96 w-full rounded-2xl" /><Skeleton className="h-64 w-full rounded-2xl" /></div>
          <Skeleton className="hidden h-96 w-full rounded-2xl lg:block" />
        </div>
      </div>
    );
  }
  if (error?.status === 404 || error?.status === 400) {
    return <EmptyState as="h1" icon={SearchX} title="Project not found" action={<LinkButton to="/my-projects">My projects</LinkButton>} />;
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  if (!project.viewer.isOwner) {
    return (
      <EmptyState
        as="h1"
        title="Only the owner can edit this project"
        action={<LinkButton to={`/projects/${id}`} variant="secondary">View project</LinkButton>}
      />
    );
  }

  const onSave = async (payload) => {
    await updateProject({ id, ...payload }).unwrap();
    toast.success('Changes saved');
    navigate(`/projects/${id}`);
  };

  return (
    <>
      <PageHeader compact icon={Pencil} tone="amber" title="Edit project" description={project.status === 'draft' ? 'This project is still a draft.' : undefined} />
      <div className="space-y-4">
        {project.status === 'archived' ? (
          <Alert tone="warning" title="This project is archived">
            Restore it from the project page before editing.
          </Alert>
        ) : (
          <ProjectForm mode="edit" defaultValues={projectToFormValues(project)} onSave={onSave} cancelTo={`/projects/${id}`} />
        )}
      </div>
    </>
  );
}
