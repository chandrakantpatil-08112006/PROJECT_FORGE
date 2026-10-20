import { ArrowLeft, CalendarDays, Check, CheckCircle2, Clock, Gauge, Link2, SearchX, Send, Target, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router';
import { ProjectBanner } from '../../components/common/ProjectCard.jsx';
import ProjectStatusBadge from '../../components/common/ProjectStatusBadge.jsx';
import SkillBadge from '../../components/common/SkillBadge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { LinkButton } from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { selectAuth } from '../../features/auth/authSlice.js';
import ApplyButton from '../../features/projects/components/ApplyButton.jsx';
import ApplicationsPanel from '../../features/projects/components/ApplicationsPanel.jsx';
import TeamPanel from '../../features/projects/components/TeamPanel.jsx';
import ManageProjectPanel from '../../features/projects/components/ManageProjectPanel.jsx';
import { useProject } from '../../features/projects/hooks.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { cn } from '../../lib/cn.js';
import { categoryLabel, difficultyLabel } from '../../lib/constants.js';
import { formatDate, formatDuration, pluralize } from '../../lib/formatters.js';
import { categoryTheme } from '../../lib/theme.js';

function Fact({ icon: Icon, label, tone, children }) {
  return (
    // dt and dd are direct children (valid <dl>); the icon is decorative and spans both rows.
    <div className="fact-tile">
      <span className={cn('fact-icon grid h-10 w-10 place-items-center rounded-xl', tone)} aria-hidden="true">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-bold leading-snug">{children}</dd>
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <button type="button" onClick={copy} className="btn-secondary inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25">
      {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}

/**
 * Small screens get the apply form last, so a floating bar keeps the call to action one tap away.
 * It tucks itself away once the real form is on screen.
 */
function MobileApplyBar({ visible, openSpots }) {
  const [targetInView, setTargetInView] = useState(false);

  useEffect(() => {
    const node = document.getElementById('apply');
    if (!node || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setTargetInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shown = visible && !targetInView;
  // Portalled to <body>: an animated ancestor would otherwise turn `position: fixed` into "fixed to the page".
  return createPortal(
    <div className={cn('apply-bar lg:hidden', shown && 'is-shown')} aria-hidden={!shown} inert={!shown}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="min-w-0 text-sm">
          <span className="block font-bold leading-tight">Interested in joining?</span>
          <span className="block truncate text-xs text-slate-500">{openSpots > 0 ? `${pluralize(openSpots, 'open spot')} on this team` : 'See how to apply'}</span>
        </p>
        <a href="#apply" className="btn-primary inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25">
          <Send className="h-4 w-4" aria-hidden="true" /> Apply
        </a>
      </div>
    </div>,
    document.body,
  );
}

function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading project" className="space-y-6">
      <div className="flex justify-between"><Skeleton className="h-5 w-32" /><Skeleton className="h-9 w-28" /></div>
      <div className="card overflow-hidden">
        <Skeleton className="h-44 w-full rounded-none sm:h-56" />
        <div className="space-y-4 p-5 sm:p-8">
          <div className="flex gap-2"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-6 w-28 rounded-full" /></div>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="grid grid-cols-2 gap-3 pt-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-16 rounded-2xl" />)}</div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_21rem]">
        <div className="space-y-3"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const { status: authStatus, user } = useSelector(selectAuth);
  const { data: project, error, isLoading, refetch } = useProject(id);
  useDocumentTitle(project?.title ?? 'Project');

  if (isLoading) return <DetailsSkeleton />;

  if (error?.status === 404 || error?.status === 400) {
    return (
      <EmptyState
        as="h1"
        icon={SearchX}
        title="Project not found"
        description="It may have been unpublished or removed, or the link is wrong."
        action={<LinkButton to="/explore">Browse projects</LinkButton>}
      />
    );
  }
  if (error) return <ErrorState error={error} onRetry={refetch} title="This project couldn't be loaded" />;

  const { viewer, owner, members, roles } = project;
  const theme = categoryTheme(project.category);
  const openSpots = roles.reduce((sum, role) => sum + role.openSlots, 0);

  // How well the signed-in viewer's own profile skills cover what the project asks for.
  const mySkillIds = new Set((user?.skills ?? []).map((skill) => skill.id));
  const matchedCount = project.requiredSkills.filter((skill) => mySkillIds.has(skill.id)).length;
  const showMatch = authStatus === 'authed' && !viewer.isOwner && project.requiredSkills.length > 0;

  const couldApply = project.status === 'recruiting' && !viewer.isOwner && !viewer.isMember && viewer.application?.status !== 'pending'
    && (authStatus === 'guest' || viewer.canApply);

  return (
    <article className="project-detail space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/explore" className="group inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-500 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" /> Back to explore
        </Link>
        <CopyLinkButton />
      </div>

      <header className="card overflow-hidden">
        <ProjectBanner project={project} className="h-40 sm:h-60" />
        <div className="space-y-5 p-5 sm:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: theme.tint, color: theme.ink }}>
                <theme.icon className="h-3 w-3" aria-hidden="true" /> {categoryLabel(project.category)}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl">{project.title}</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-600">{project.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2.5">
              <Avatar name={owner.name} src={owner.avatarUrl} size="sm" />
              <span>Led by <strong className="font-semibold text-ink">{owner.name}</strong> <span className="text-slate-500">@{owner.username}</span></span>
            </span>
            {project.publishedAt && (
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" /> Published {formatDate(project.publishedAt)}</span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Fact icon={Gauge} label="Difficulty" tone="bg-violet-50 text-violet-600">{difficultyLabel(project.difficulty)}</Fact>
            <Fact icon={Clock} label="Expected duration" tone="bg-sky-50 text-sky-600">{formatDuration(project.expectedDurationWeeks).replace(/ \(.*\)/, '')}</Fact>
            <Fact icon={Users} label="Team" tone="bg-emerald-50 text-emerald-600">{project.memberCount} of {project.teamSize} people</Fact>
            <Fact icon={Target} label="Open spots" tone="bg-amber-50 text-amber-600">{roles.length === 0 ? 'No roles yet' : openSpots === 0 ? 'All filled' : pluralize(openSpots, 'spot')}</Fact>
          </dl>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_21rem]">
        <div className="min-w-0 space-y-10">
          <Reveal as="section" aria-labelledby="about">
            <h2 id="about" className="mb-3 text-xl font-bold">About this project</h2>
            <p className="max-w-3xl whitespace-pre-wrap break-words leading-relaxed text-slate-800">{project.description}</p>
          </Reveal>

          <Reveal as="section" aria-labelledby="skills">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="skills" className="text-xl font-bold">Required skills</h2>
              <span className="text-sm text-slate-500">{pluralize(project.requiredSkills.length, 'skill')}</span>
            </div>

            {showMatch && (
              <div className="card mb-4 flex flex-wrap items-center gap-4 p-4" role="group" aria-label="How your skills match">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white', matchedCount > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-slate-400 to-slate-500')}>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {matchedCount === 0 ? 'None of your listed skills match yet' : `You have ${matchedCount} of ${project.requiredSkills.length} required skills`}
                  </p>
                  <div className="progress-track mt-2" style={{ height: '.35rem' }} role="progressbar" aria-label="Skill match" aria-valuemin={0} aria-valuemax={project.requiredSkills.length} aria-valuenow={matchedCount}>
                    <div className="progress-fill" style={{ width: `${(matchedCount / project.requiredSkills.length) * 100}%` }} />
                  </div>
                </div>
                {matchedCount === 0 && <Link to="/profile/edit" className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900">Update your skills</Link>}
              </div>
            )}

            <ul className="flex flex-wrap gap-2">
              {project.requiredSkills.map((skill) => {
                const mine = showMatch && mySkillIds.has(skill.id);
                return (
                  <li key={skill.id} className="inline-flex items-center p-0.5">
                    <SkillBadge skill={skill} className={cn('px-2.5 py-1 text-sm', mine && 'ring-2 ring-emerald-400/60 ring-offset-1')} />
                    {mine && (<><Check className="-ml-1.5 h-4 w-4 rounded-full bg-emerald-500 p-0.5 text-white" aria-hidden="true" /><span className="sr-only">You have this skill</span></>)}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal as="section" aria-labelledby="roles">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="roles" className="text-xl font-bold">Roles</h2>
              <span className="text-sm text-slate-500">{roles.length === 0 ? 'No roles yet' : pluralize(openSpots, 'open spot')}</span>
            </div>
            {roles.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-500">
                The owner hasn&apos;t added any roles yet.
              </p>
            ) : (
              <ul className="grid gap-3">
                {roles.map((role) => {
                  const filled = role.slots - role.openSlots;
                  return (
                    <li key={role.id} className="card role-tile p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold">{role.title}</h3>
                          {role.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{role.description}</p>}
                        </div>
                        <Badge tone={role.openSlots > 0 ? 'success' : 'neutral'}>
                          {role.openSlots > 0 ? `${role.openSlots} of ${role.slots} open` : 'Filled'}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5" role="img" aria-label={`${filled} of ${role.slots} spots filled`}>
                          {Array.from({ length: role.slots }, (_, index) => (
                            <span key={index} className={cn('h-2 w-6 rounded-full', index < filled ? 'bg-gradient-to-r from-brand-600 to-violet-600' : 'bg-slate-200')} />
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{filled}/{role.slots} filled</span>
                          {couldApply && role.openSlots > 0 && (
                            <a href="#apply" className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                              Apply <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Reveal>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div id="apply" className="card apply-target p-4 sm:p-5">
            <ApplyButton project={project} />
          </div>

          {viewer.isOwner && <ManageProjectPanel project={project} />}
          {viewer.isOwner && <ApplicationsPanel project={project} />}

          <TeamPanel project={project} members={members} viewer={viewer} />
        </aside>
      </div>

      <MobileApplyBar visible={couldApply} openSpots={openSpots} />
    </article>
  );
}
