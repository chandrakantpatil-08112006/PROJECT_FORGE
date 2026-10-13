import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import toast from 'react-hot-toast';
import Button, { LinkButton } from '../../../components/ui/Button.jsx';
import Select from '../../../components/ui/Select.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import { selectAuth } from '../../auth/authSlice.js';
import { useCreateApplicationMutation, useWithdrawApplicationMutation } from '../projectsApi.js';

/**
 * Every state of the apply call to action follows the API's project and viewer state.
 */
export default function ApplyButton({ project }) {
  const { status, user } = useSelector(selectAuth);
  const location = useLocation();
  const [roleId, setRoleId] = useState('');
  const [message, setMessage] = useState('');
  const [relevantSkills, setRelevantSkills] = useState([]);
  const [apply, { isLoading }] = useCreateApplicationMutation();
  const [withdraw, { isLoading: withdrawing }] = useWithdrawApplicationMutation();
  const { viewer } = project;

  if (status === 'guest') {
    return (
      <div className="space-y-2">
        <LinkButton to="/login" state={{ from: location }} size="lg" className="w-full">Sign in to apply</LinkButton>
        <p className="text-center text-sm text-slate-500">
          New here? <Link to="/register" className="font-medium text-brand-700 underline">Create an account</Link>
        </p>
      </div>
    );
  }

  if (viewer?.isOwner) {
    return <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">This is your project. Use the controls below to manage it.</p>;
  }

  if (viewer?.isMember) {
    return <Button size="lg" className="w-full" disabled>You&apos;re on this team</Button>;
  }

  if (viewer?.application?.status === 'pending') {
    return (
      <div className="space-y-2">
        <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-600">Application pending</p>
        <Button size="sm" variant="secondary" className="w-full" loading={withdrawing} onClick={async () => {
          try {
            await withdraw({ id: project.id, applicationId: viewer.application.id }).unwrap();
            toast.success('Application withdrawn');
          } catch (error) {
            toast.error(error.message);
          }
        }}>Withdraw application</Button>
      </div>
    );
  }

  if (project.status !== 'recruiting') {
    return (
      <div className="space-y-2">
        <Button size="lg" className="w-full" disabled>Not accepting applications</Button>
        <p className="text-center text-sm text-slate-500">This project isn&apos;t recruiting right now.</p>
      </div>
    );
  }

  if (!viewer?.canApply) {
    return (
      <div className="space-y-2">
        <Button size="lg" className="w-full" disabled>All roles are filled</Button>
        <p className="text-center text-sm text-slate-500">Check back later; spots can open up.</p>
      </div>
    );
  }

  const openRoles = project.roles.filter((role) => role.openSlots > 0);
  const selectedRoleId = openRoles.some((role) => role.id === roleId) ? roleId : openRoles[0]?.id;

  async function submit(event) {
    event.preventDefault();
    try {
      await apply({ id: project.id, roleId: selectedRoleId, message, relevantSkills }).unwrap();
      toast.success('Application sent');
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block space-y-1 text-sm font-medium">
        <span>Role</span>
        <Select value={selectedRoleId} onChange={(event) => setRoleId(event.target.value)}>
          {openRoles.map((role) => <option key={role.id} value={role.id}>{role.title} ({role.openSlots} open)</option>)}
        </Select>
      </label>
      <Textarea label="Message to the owner" rows={4} max={2000} count={message.length} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell them why you are interested and what you can contribute." />
      {user?.skills?.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Relevant skills from your profile</legend>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => {
              const selected = relevantSkills.includes(skill.id);
              return (
                <label key={skill.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${selected ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line text-slate-600'}`}>
                  <input className="sr-only" type="checkbox" checked={selected} onChange={() => setRelevantSkills((current) => selected ? current.filter((id) => id !== skill.id) : [...current, skill.id])} />
                  {skill.name}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <Button type="submit" size="lg" className="w-full" loading={isLoading}>Apply to join</Button>
    </form>
  );
}
