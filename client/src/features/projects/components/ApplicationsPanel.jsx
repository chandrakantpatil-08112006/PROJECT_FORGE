import { Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../../../components/ui/Avatar.jsx';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import { useDecideApplicationMutation, useListProjectApplicationsQuery } from '../projectsApi.js';

export default function ApplicationsPanel({ project }) {
  const { data: applications = [], error, isLoading, refetch } = useListProjectApplicationsQuery({ id: project.id });
  const [decide, { isLoading: saving }] = useDecideApplicationMutation();

  async function review(application, status) {
    try {
      await decide({ id: project.id, applicationId: application.id, status }).unwrap();
      toast.success(status === 'accepted' ? 'Applicant added to the team' : 'Application declined');
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  function canAccept(application) {
    const role = project.roles.find((item) => item.id === String(application.roleId));
    return project.status === 'recruiting' && project.memberCount < project.teamSize && role?.openSlots > 0;
  }

  return (
    <section className="space-y-3 card p-4 sm:p-5" aria-labelledby="applications-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="applications-heading" className="text-sm font-bold">Applications</h2>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">{applications.filter((item) => item.status === 'pending').length} pending</span>
      </div>
      {isLoading ? <div className="space-y-2" role="status" aria-label="Loading applications"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div> : null}
      {error ? <ErrorState error={error} onRetry={refetch} title="Applications couldn't be loaded" /> : null}
      {!isLoading && !error && applications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-slate-50/60 px-4 py-6 text-center">
          <Inbox className="h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">No applications yet. They&apos;ll show up here.</p>
        </div>
      ) : null}
      <ul className="divide-y divide-line">
        {applications.map((application) => (
          <li key={application.id} className="space-y-3 py-4 first:pt-1 last:pb-0">
            <div className="flex items-center gap-3">
              <Avatar name={application.applicant.name} src={application.applicant.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{application.applicant.name}</p>
                <p className="truncate text-xs text-slate-500">@{application.applicant.username} · {project.roles.find((role) => role.id === application.roleId)?.title ?? 'Role removed'}</p>
              </div>
              <span className={`application-status application-status-${application.status} rounded-full px-2.5 py-1 text-xs capitalize`}>{application.status}</span>
            </div>
            {application.message && <p className="whitespace-pre-wrap text-sm text-slate-700">{application.message}</p>}
            {application.relevantSkills?.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Relevant skills">
                {application.relevantSkills.map((skill) => <li key={skill.id ?? skill._id} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">{skill.name}</li>)}
              </ul>
            )}
            {application.status === 'pending' && (
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" disabled={saving} onClick={() => review(application, 'rejected')}>Decline</Button>
                <Button size="sm" disabled={saving || !canAccept(application)} onClick={() => review(application, 'accepted')}>Accept</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
