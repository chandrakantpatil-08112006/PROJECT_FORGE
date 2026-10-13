import toast from 'react-hot-toast';
import { Link } from 'react-router';
import Avatar from '../../../components/ui/Avatar.jsx';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import {
  useDecideApplicationMutation,
  useMyApplicationsQuery,
  useReceivedApplicationsQuery,
  useWithdrawApplicationMutation,
} from '../projectsApi.js';

function roleTitle(application) {
  return application.project?.roles?.find((role) => String(role._id ?? role.id) === String(application.roleId))?.title ?? 'Role';
}

function canAccept(application) {
  const project = application.project;
  const role = project?.roles?.find((item) => String(item._id ?? item.id) === String(application.roleId));
  return project?.status === 'recruiting'
    && project.memberCount < project.teamSize
    && role
    && role.filled < role.slots;
}

function ApplicationRow({ application, ownerView, onReview, onWithdraw, busy }) {
  const person = ownerView ? application.applicant : null;
  const project = application.project;
  return (
    <li className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        {ownerView && <Avatar name={person?.name ?? 'Developer'} src={person?.avatarUrl} size="sm" />}
        {!ownerView && <Avatar name={project?.title ?? 'Project'} size="sm" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{ownerView ? person?.name : project?.title}</p>
          <p className="truncate text-xs text-slate-500">
            {ownerView ? `@${person?.username} · ${roleTitle(application)}` : `Applied for ${roleTitle(application)}`}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">{application.status}</span>
      </div>
      {application.message && <p className="whitespace-pre-wrap text-sm text-slate-700">{application.message}</p>}
      {application.relevantSkills?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Relevant skills">
          {application.relevantSkills.map((skill) => <li key={skill.id ?? skill._id} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">{skill.name}</li>)}
        </ul>
      )}
      <div className="flex items-center justify-between gap-2">
        <Link className="text-sm font-medium text-brand-700 underline" to={`/projects/${project?.id ?? project?._id}`}>View project</Link>
        {ownerView && application.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => onReview(application, 'rejected')}>Reject</Button>
            <Button size="sm" disabled={busy || !canAccept(application)} onClick={() => onReview(application, 'accepted')}>Accept</Button>
          </div>
        )}
        {!ownerView && application.status === 'pending' && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => onWithdraw(application)}>Withdraw</Button>
        )}
      </div>
    </li>
  );
}

export default function ApplicationDashboard() {
  const received = useReceivedApplicationsQuery({ status: 'all' });
  const mine = useMyApplicationsQuery({ status: 'all' });
  const [decide, { isLoading: deciding }] = useDecideApplicationMutation();
  const [withdraw, { isLoading: withdrawing }] = useWithdrawApplicationMutation();

  async function review(application, status) {
    try {
      await decide({ id: application.project.id ?? application.project._id, applicationId: application.id, status }).unwrap();
      toast.success(status === 'accepted' ? 'Applicant added to the team' : 'Application rejected');
    } catch (error) { toast.error(error.message); }
  }

  async function cancel(application) {
    try {
      await withdraw({ id: application.project.id ?? application.project._id, applicationId: application.id }).unwrap();
      toast.success('Application withdrawn');
    } catch (error) { toast.error(error.message); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-xl border border-line bg-white" aria-labelledby="received-applications">
        <div className="border-b border-line p-4">
          <h2 id="received-applications" className="font-semibold">Applications to your projects</h2>
          <p className="mt-1 text-sm text-slate-500">Review requests and build your teams.</p>
        </div>
        {received.isLoading ? <p className="p-4 text-sm text-slate-500">Loading applications…</p> : null}
        {received.error ? <ErrorState error={received.error} onRetry={received.refetch} title="Received applications couldn't be loaded" /> : null}
        {!received.isLoading && !received.error && received.data?.length === 0 ? <p className="p-4 text-sm text-slate-500">No applications for your projects yet.</p> : null}
        <ul className="divide-y divide-line">{(received.data ?? []).map((application) => <ApplicationRow key={application.id} application={application} ownerView onReview={review} busy={deciding} />)}</ul>
      </section>

      <section className="rounded-xl border border-line bg-white" aria-labelledby="my-applications">
        <div className="border-b border-line p-4">
          <h2 id="my-applications" className="font-semibold">Your applications</h2>
          <p className="mt-1 text-sm text-slate-500">Check decisions or withdraw a pending request.</p>
        </div>
        {mine.isLoading ? <p className="p-4 text-sm text-slate-500">Loading your applications…</p> : null}
        {mine.error ? <ErrorState error={mine.error} onRetry={mine.refetch} title="Your applications couldn't be loaded" /> : null}
        {!mine.isLoading && !mine.error && mine.data?.length === 0 ? <p className="p-4 text-sm text-slate-500">You haven't applied to any projects yet.</p> : null}
        <ul className="divide-y divide-line">{(mine.data ?? []).map((application) => <ApplicationRow key={application.id} application={application} onWithdraw={cancel} busy={withdrawing} />)}</ul>
      </section>
    </div>
  );
}
