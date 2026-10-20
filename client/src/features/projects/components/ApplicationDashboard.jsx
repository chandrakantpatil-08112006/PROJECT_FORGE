import { ExternalLink, Inbox, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import Avatar from '../../../components/ui/Avatar.jsx';
import Button, { LinkButton } from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
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
    <li className="list-row space-y-3 p-4">
      <div className="flex items-center gap-3">
        {ownerView && <Avatar name={person?.name ?? 'Developer'} src={person?.avatarUrl} size="sm" />}
        {!ownerView && <Avatar name={project?.title ?? 'Project'} size="sm" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{ownerView ? person?.name : project?.title}</p>
          <p className="truncate text-xs text-slate-500">
            {ownerView ? `@${person?.username} · ${roleTitle(application)}` : `Applied for ${roleTitle(application)}`}
          </p>
        </div>
        <span className={`application-status application-status-${application.status} rounded-full px-2.5 py-1 text-xs capitalize`}>{application.status}</span>
      </div>
      {application.message && <p className="whitespace-pre-wrap text-sm text-slate-700">{application.message}</p>}
      {application.relevantSkills?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Relevant skills">
          {application.relevantSkills.map((skill) => <li key={skill.id ?? skill._id} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">{skill.name}</li>)}
        </ul>
      )}
      <div className="flex items-center justify-between gap-2">
        <Link className="inline-flex items-center gap-1 rounded text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20" to={`/projects/${project?.id ?? project?._id}`}>View project <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>
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
      <section className="card" aria-labelledby="received-applications">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><Inbox className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="received-applications" className="font-bold">Applications to your projects</h2>
            <p className="text-sm text-slate-500">Review requests and build your teams.</p>
          </div>
        </div>
        {received.isLoading ? <div className="space-y-3 p-4" role="status" aria-label="Loading received applications">{[0, 1].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : null}
        {received.error ? <ErrorState error={received.error} onRetry={received.refetch} title="Received applications couldn't be loaded" /> : null}
        {!received.isLoading && !received.error && received.data?.length === 0 ? <p className="p-6 text-center text-sm text-slate-500">No applications for your projects yet. When someone applies, you&apos;ll see them here.</p> : null}
        <ul className="divide-y divide-line">{(received.data ?? []).map((application) => <ApplicationRow key={application.id} application={application} ownerView onReview={review} busy={deciding} />)}</ul>
      </section>

      <section className="card" aria-labelledby="my-applications">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Send className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="my-applications" className="font-bold">Your applications</h2>
            <p className="text-sm text-slate-500">Check decisions or withdraw a pending request.</p>
          </div>
        </div>
        {mine.isLoading ? <div className="space-y-3 p-4" role="status" aria-label="Loading your applications">{[0, 1].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : null}
        {mine.error ? <ErrorState error={mine.error} onRetry={mine.refetch} title="Your applications couldn't be loaded" /> : null}
        {!mine.isLoading && !mine.error && mine.data?.length === 0 ? <div className="flex flex-col items-center gap-3 p-6 text-center"><p className="text-sm text-slate-500">You haven&apos;t applied to any projects yet.</p><LinkButton to="/explore" variant="secondary" size="sm">Explore projects</LinkButton></div> : null}
        <ul className="divide-y divide-line">{(mine.data ?? []).map((application) => <ApplicationRow key={application.id} application={application} onWithdraw={cancel} busy={withdrawing} />)}</ul>
      </section>
    </div>
  );
}
