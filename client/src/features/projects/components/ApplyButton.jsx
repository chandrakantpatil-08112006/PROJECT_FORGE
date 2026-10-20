import { CheckCircle2, Clock, Lock, LogIn, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import toast from 'react-hot-toast';
import Button, { LinkButton } from '../../../components/ui/Button.jsx';
import ChoiceGroup from '../../../components/ui/ChoiceGroup.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import { cn } from '../../../lib/cn.js';
import { selectAuth } from '../../auth/authSlice.js';
import { useCreateApplicationMutation, useWithdrawApplicationMutation } from '../projectsApi.js';

const linkStyles = 'font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 hover:decoration-brand-600';

/** A consistent frame for every state of the call to action. */
function Panel({ icon: Icon, title, tone = 'brand', children }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', success: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-500' };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tones[tone])}><Icon className="h-5 w-5" aria-hidden="true" /></span>
        <h2 className="text-base font-bold leading-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

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
      <Panel icon={LogIn} title="Interested in joining?">
        <p className="text-sm text-slate-600">Sign in to apply for a role and tell the owner what you can contribute.</p>
        <div className="space-y-2">
          <LinkButton to="/login" state={{ from: location }} size="lg" className="w-full">Sign in to apply</LinkButton>
          <p className="text-center text-sm text-slate-500">
            New here? <Link to="/register" className={linkStyles}>Create an account</Link>
          </p>
        </div>
      </Panel>
    );
  }

  if (viewer?.isOwner) {
    return (
      <Panel icon={Users} title="This is your project" tone="slate">
        <p className="text-sm text-slate-600">Applications arrive below. Use the controls to manage the project and its team.</p>
      </Panel>
    );
  }

  if (viewer?.isMember) {
    return (
      <Panel icon={CheckCircle2} title="You're on this team" tone="success">
        <p className="text-sm text-slate-600">Find this project under “I&apos;ve joined” in My projects.</p>
      </Panel>
    );
  }

  if (viewer?.application?.status === 'pending') {
    return (
      <Panel icon={Clock} title="Application pending" tone="amber">
        <p className="text-sm text-slate-600">The owner has your request and will review it. You&apos;ll see the decision on your dashboard.</p>
        <Button size="sm" variant="secondary" className="w-full" loading={withdrawing} onClick={async () => {
          try {
            await withdraw({ id: project.id, applicationId: viewer.application.id }).unwrap();
            toast.success('Application withdrawn');
          } catch (error) {
            toast.error(error.message);
          }
        }}>Withdraw application</Button>
      </Panel>
    );
  }

  if (project.status !== 'recruiting') {
    return (
      <Panel icon={Lock} title="Not accepting applications" tone="slate">
        <p className="text-sm text-slate-600">This project isn&apos;t recruiting right now.</p>
      </Panel>
    );
  }

  if (!viewer?.canApply) {
    return (
      <Panel icon={Users} title="All roles are filled" tone="slate">
        <p className="text-sm text-slate-600">Check back later; spots can open up.</p>
      </Panel>
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
    <form onSubmit={submit} className="space-y-4">
      <Panel icon={Send} title="Apply to join">
        <ChoiceGroup
          legend="Role"
          name="apply-role"
          value={selectedRoleId}
          onChange={(event) => setRoleId(event.target.value)}
          columns="grid-cols-1"
          options={openRoles.map((role) => ({ value: role.id, label: role.title, note: `${role.openSlots} of ${role.slots} open` }))}
        />
      </Panel>
      <Textarea label="Message to the owner" rows={4} max={2000} count={message.length} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell them why you are interested and what you can contribute." />
      {user?.skills?.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">Relevant skills from your profile</legend>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => {
              const selected = relevantSkills.includes(skill.id);
              return (
                <label key={skill.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus-within:ring-4 focus-within:ring-brand-500/20 ${selected ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50'}`}>
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
