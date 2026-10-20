import { Crown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { pluralize } from '../../../lib/formatters.js';
import Avatar from '../../../components/ui/Avatar.jsx';
import Button from '../../../components/ui/Button.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import {
  useLeaveProjectMutation,
  useRemoveTeamMemberMutation,
  useTransferProjectOwnerMutation,
} from '../projectsApi.js';

export default function TeamPanel({ project, members, viewer }) {
  const [removeMember, { isLoading: removing }] = useRemoveTeamMemberMutation();
  const [leaveProject, { isLoading: leaving }] = useLeaveProjectMutation();
  const [transferOwner, { isLoading: transferring }] = useTransferProjectOwnerMutation();
  const [confirmation, setConfirmation] = useState(null);
  const busy = removing || leaving || transferring;

  async function confirmAction() {
    try {
      if (confirmation.type === 'remove') {
        await removeMember({ id: project.id, memberId: confirmation.member.id }).unwrap();
        toast.success('Team member removed');
      } else if (confirmation.type === 'leave') {
        await leaveProject(project.id).unwrap();
        toast.success('You left the project');
      } else {
        await transferOwner({ id: project.id, userId: confirmation.member.id }).unwrap();
        toast.success('Project ownership transferred');
      }
      setConfirmation(null);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <>
      <section aria-labelledby="team" className="card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="team" className="text-sm font-bold">Current team</h2>
          <span className="text-xs font-semibold text-slate-500">{project.memberCount}/{project.teamSize}</span>
        </div>
        <div className="progress-track mt-2" role="progressbar" aria-valuenow={project.memberCount} aria-valuemin={0} aria-valuemax={project.teamSize} aria-label="Team capacity">
          <div className="progress-fill" style={{ width: `${project.teamSize > 0 ? Math.min(100, (project.memberCount / project.teamSize) * 100) : 0}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {project.teamSize - project.memberCount > 0 ? `${pluralize(project.teamSize - project.memberCount, 'spot')} left on the team` : 'The team is full'}
        </p>
        <ul className="mt-4 space-y-3.5 border-t border-line pt-4">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar name={member.name} src={member.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <span className="truncate">{member.name}</span>
                  {member.role === 'owner' && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Project owner" />}
                </p>
                <p className="truncate text-xs text-slate-500">{member.title || (member.role === 'owner' ? 'Project Lead' : 'Member')}</p>
              </div>
              {viewer.isOwner && member.role === 'member' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirmation({ type: 'transfer', member })}>Transfer</Button>
                  <Button size="sm" variant="danger" disabled={busy} onClick={() => setConfirmation({ type: 'remove', member })}>Remove</Button>
                </div>
              )}
              {!viewer.isOwner && member.id === viewer.userId && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirmation({ type: 'leave', member })}>Leave</Button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.type === 'transfer' ? 'Transfer project ownership?' : confirmation?.type === 'remove' ? 'Remove this team member?' : 'Leave this project?'}
        description={confirmation?.type === 'transfer'
          ? `${confirmation.member.name} will become the owner. You will remain on the team.`
          : confirmation?.type === 'remove'
            ? `${confirmation.member.name} will lose access to the team.`
            : 'Your membership and role spot will be released.'}
        confirmLabel={confirmation?.type === 'transfer' ? 'Transfer ownership' : confirmation?.type === 'remove' ? 'Remove member' : 'Leave project'}
        tone={confirmation?.type === 'transfer' ? 'primary' : 'danger'}
        loading={busy}
        onConfirm={confirmAction}
        onCancel={() => setConfirmation(null)}
      />
    </>
  );
}
