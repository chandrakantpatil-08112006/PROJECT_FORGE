import { useState } from 'react';
import toast from 'react-hot-toast';
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
      <section aria-labelledby="team" className="rounded-xl border border-line bg-white p-4">
        <h2 id="team" className="mb-3 text-sm font-semibold">Current team ({members.length})</h2>
        <ul className="space-y-4">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar name={member.name} src={member.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
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
