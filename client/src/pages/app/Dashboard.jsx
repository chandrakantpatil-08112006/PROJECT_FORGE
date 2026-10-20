import { ArrowRight, CheckCircle2, Circle, Compass, FilePen, FolderKanban, Inbox, LayoutDashboard, PartyPopper, Plus, Radio, Rocket, UserRound, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import PageHeader from '../../components/common/PageHeader.jsx';
import ProjectStatusBadge from '../../components/common/ProjectStatusBadge.jsx';
import SkillBadge from '../../components/common/SkillBadge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { LinkButton } from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { selectUser } from '../../features/auth/authSlice.js';
import ApplicationDashboard from '../../features/projects/components/ApplicationDashboard.jsx';
import { profileChecklist } from '../../features/profile/checklist.js';
import { useMyApplicationsQuery, useMyProjectsQuery, useReceivedApplicationsQuery } from '../../features/projects/projectsApi.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { cn } from '../../lib/cn.js';
import { categoryLabel, difficultyLabel } from '../../lib/constants.js';
import { pluralize } from '../../lib/formatters.js';
import { categoryTheme } from '../../lib/theme.js';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_ACTIONS = [
  { to: '/projects/new', icon: Rocket, title: 'Start a project', text: 'Share an idea', a: '#6366f1', b: '#8b5cf6' },
  { to: '/explore', icon: Compass, title: 'Find a project', text: 'Browse open roles', a: '#06b6d4', b: '#10b981' },
  { to: '/my-projects', icon: FolderKanban, title: 'My projects', text: 'Created and joined', a: '#f59e0b', b: '#f97316' },
  { to: '/profile/edit', icon: UserRound, title: 'Your profile', text: 'Polish how you appear', a: '#ec4899', b: '#f43f5e' },
];

const roleTitle = (application) =>
  application.project?.roles?.find((role) => String(role._id ?? role.id) === String(application.roleId))?.title ?? 'a role';

function Stat({ label, value, icon: Icon, from, to, hint, suffix = '' }) {
  const shown = useCountUp(value);
  return (
    <div className="card stat-card relative p-4 sm:p-5" style={{ '--a': from, '--b': to }}>
      <dt className="pr-12 text-sm font-semibold text-slate-500">
        {label}
        <span className="stat-icon absolute right-4 top-4 z-10 sm:right-5 sm:top-5" aria-hidden="true"><Icon className="h-5 w-5" /></span>
      </dt>
      <dd className="relative z-10 mt-3">
        <span className="block font-display text-4xl font-extrabold tabular-nums tracking-tight">{shown}{suffix}</span>
        {hint && <span className="mt-1 block truncate text-xs font-medium text-slate-500">{hint}</span>}
      </dd>
    </div>
  );
}

/** Circular completeness meter. Purely a view of `done / total`. */
function Ring({ done, total }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? done / total : 0;
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Profile completeness">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4f46e5" /><stop offset="1" stopColor="#06b6d4" /></linearGradient>
        </defs>
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e8eaf3" strokeWidth="6" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke="url(#ring-grad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - fraction)} style={{ transition: 'stroke-dashoffset .9s var(--ease)' }} />
      </svg>
      <span className="font-display text-sm font-extrabold">{Math.round(fraction * 100)}%</span>
    </div>
  );
}

function ProjectRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4" aria-hidden="true">
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const user = useSelector(selectUser);
  const { data, error, isLoading, refetch } = useMyProjectsQuery({ relation: 'owned', status: 'all', limit: 50 });
  const joined = useMyProjectsQuery({ relation: 'joined', status: 'all', limit: 1 });
  // Same arguments as the "Applications and teams" section below, so RTK Query serves both from one request.
  const received = useReceivedApplicationsQuery({ status: 'all' });
  const sent = useMyApplicationsQuery({ status: 'all' });

  const checklist = profileChecklist(user);
  const done = checklist.filter((item) => item.done).length;
  const projects = data?.items ?? [];
  const partial = (data?.meta?.total ?? 0) > projects.length; // only the latest 50 are loaded for the breakdown
  const live = projects.filter((p) => ['recruiting', 'in_progress'].includes(p.status));
  const drafts = projects.filter((p) => p.status === 'draft');
  const openSpots = projects
    .filter((p) => p.status === 'recruiting')
    .reduce((sum, p) => sum + (p.roles ?? []).reduce((count, role) => count + (role.openSlots ?? 0), 0), 0);

  const pendingReceived = (received.data ?? []).filter((application) => application.status === 'pending');
  const pendingSent = (sent.data ?? []).filter((application) => application.status === 'pending');

  // Things the user can act on right now, all derived from their own records.
  const attention = [
    ...pendingReceived.map((application) => ({
      key: `app-${application.id}`,
      to: `/projects/${application.project?.id ?? application.project?._id}`,
      icon: Inbox,
      tone: 'bg-amber-50 text-amber-600',
      title: `${application.applicant?.name ?? 'Someone'} applied as ${roleTitle(application)}`,
      text: application.project?.title,
      cta: 'Review',
    })),
    ...drafts.map((project) => ({
      key: `draft-${project.id}`,
      to: `/projects/${project.id}`,
      icon: FilePen,
      tone: 'bg-slate-100 text-slate-600',
      title: `“${project.title}” is still a draft`,
      text: 'Publish it to start receiving applications',
      cta: 'Open',
    })),
  ];
  const attentionLoading = received.isLoading || isLoading;

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Here's where your projects and profile stand."
        actions={
          <>
            <LinkButton to="/explore" variant="plain" className="hero-ghost">Explore projects</LinkButton>
            <LinkButton to="/projects/new" variant="plain" className="hero-cta"><Plus className="h-4 w-4" aria-hidden="true" /> New project</LinkButton>
          </>
        }
      />

      <nav aria-label="Quick actions" className="stagger -mt-2 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, text, a, b }) => (
          <Link key={title} to={to} className="card card-hover group flex items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
            <span className="stat-icon shrink-0" style={{ '--a': a, '--b': b }}><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{title}</span>
              <span className="block truncate text-xs text-slate-500">{text}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <div className="dashboard-layout grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="stats">
            <h2 id="stats" className="sr-only">Summary</h2>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-label="Loading summary">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : error ? (
              <ErrorState error={error} onRetry={refetch} title="Your projects couldn't be loaded" />
            ) : (
              <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat
                  label="Your projects"
                  value={data.meta.total}
                  icon={FolderKanban}
                  from="#6366f1"
                  to="#8b5cf6"
                  hint={drafts.length > 0 ? `${pluralize(drafts.length, 'draft')}${partial ? '+' : ''}` : 'No drafts waiting'}
                />
                <Stat
                  label="Live"
                  value={live.length}
                  suffix={partial ? '+' : ''}
                  icon={Radio}
                  from="#10b981"
                  to="#06b6d4"
                  hint={openSpots > 0 ? `${pluralize(openSpots, 'open spot')} to fill` : 'Recruiting or in progress'}
                />
                <Stat
                  label="To review"
                  value={pendingReceived.length}
                  icon={Inbox}
                  from="#f59e0b"
                  to="#f97316"
                  hint={received.isLoading ? 'Checking…' : pendingReceived.length > 0 ? 'Applications waiting' : 'Nothing waiting'}
                />
                <Stat
                  label="Teams joined"
                  value={joined.data?.meta?.total ?? 0}
                  icon={Users}
                  from="#ec4899"
                  to="#f43f5e"
                  hint={pendingSent.length > 0 ? `${pluralize(pendingSent.length, 'application')} pending` : 'Projects you joined'}
                />
              </dl>
            )}
          </section>

          <section aria-labelledby="attention" className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-amber-50/70 to-white p-4 sm:px-5">
              <div>
                <h2 id="attention" className="font-bold">Needs your attention</h2>
                <p className="text-sm text-slate-500">Applications to review and drafts to publish.</p>
              </div>
              {attention.length > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{attention.length}</span>}
            </div>
            {attentionLoading ? (
              <div className="divide-y divide-line">{[0, 1].map((i) => <ProjectRowSkeleton key={i} />)}</div>
            ) : attention.length === 0 ? (
              <div className="flex items-center gap-3 p-5 text-sm text-slate-600">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><PartyPopper className="h-5 w-5" aria-hidden="true" /></span>
                You&apos;re all caught up. Nothing is waiting on you right now.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {attention.slice(0, 5).map((item) => (
                  <li key={item.key}>
                    <Link to={item.to} className="attention-row group flex items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500/20 sm:px-5">
                      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', item.tone)}><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        {item.text && <span className="block truncate text-xs text-slate-500">{item.text}</span>}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{item.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="recent" className="text-xl font-bold">Recently updated</h2>
              <Link to="/my-projects" className="text-sm font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 hover:decoration-brand-600">All my projects</Link>
            </div>

            {isLoading ? (
              <div className="card divide-y divide-line overflow-hidden" role="status" aria-label="Loading projects">{[0, 1, 2].map((i) => <ProjectRowSkeleton key={i} />)}</div>
            ) : !error && projects.length === 0 ? (
              <div className="card border-dashed p-8 text-center">
                <span className="empty-state-icon mx-auto grid h-14 w-14 place-items-center rounded-2xl border bg-white text-brand-600"><FolderKanban className="h-7 w-7" aria-hidden="true" /></span>
                <p className="mt-3 font-bold">You haven&apos;t created a project yet</p>
                <p className="mt-1 text-sm text-slate-600">Describe your idea, list the roles you need and publish it.</p>
                <LinkButton to="/projects/new" className="mt-4">Create your first project</LinkButton>
              </div>
            ) : (
              !error && (
                <ul className="card divide-y divide-line overflow-hidden">
                  {projects.slice(0, 5).map((project) => {
                    const theme = categoryTheme(project.category);
                    const openRoles = (project.roles ?? []).filter((role) => role.openSlots > 0).length;
                    return (
                      <li key={project.id}>
                        <Link to={`/projects/${project.id}`} className="list-row group flex items-center gap-4 p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500/20">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
                            <theme.icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold group-hover:text-brand-700">{project.title}</p>
                            <p className="truncate text-sm text-slate-500">
                              {categoryLabel(project.category)} · {difficultyLabel(project.difficulty)}{openRoles > 0 ? ` · ${pluralize(openRoles, 'open role')}` : ''}
                            </p>
                            {project.teamSize > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="team-meter w-24" aria-hidden="true"><span style={{ width: `${Math.min(100, (project.memberCount / project.teamSize) * 100)}%` }} /></div>
                                <span className="text-xs text-slate-500">{project.memberCount}/{project.teamSize} people</span>
                              </div>
                            )}
                          </div>
                          <ProjectStatusBadge status={project.status} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section aria-labelledby="profile" className="card bg-gradient-to-b from-brand-50/70 to-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size="lg" />
              <div className="min-w-0">
                <h2 id="profile" className="truncate font-bold">{user.name}</h2>
                <p className="truncate text-sm text-slate-500">@{user.username}</p>
                <p className="text-sm text-slate-500">{difficultyLabel(user.experienceLevel)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <Ring done={done} total={checklist.length} />
              <div>
                <p className="text-sm font-bold">Profile {done === checklist.length ? 'complete' : 'strength'}</p>
                <p className="text-xs text-slate-500">{done === checklist.length ? 'Owners will find it easy to trust you.' : `${done} of ${checklist.length} steps done`}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {checklist.map((item) => (
                <li key={item.label} className={cn('flex items-center gap-2 text-sm', item.done ? 'text-slate-500 line-through' : 'text-slate-700')}>
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />}
                  {item.label}
                </li>
              ))}
            </ul>
            <LinkButton to="/profile/edit" variant="secondary" size="sm" className="mt-4 w-full">Edit profile</LinkButton>
          </section>

          {user.skills.length > 0 && (
            <section aria-labelledby="my-skills" className="card p-5">
              <h2 id="my-skills" className="mb-3 text-sm font-bold">Your skills</h2>
              <ul className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => <li key={skill.id}><SkillBadge skill={skill} /></li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <section id="applications" className="mt-8 scroll-mt-24 space-y-3" aria-label="Project applications">
        <h2 className="text-xl font-bold">Applications and teams</h2>
        <ApplicationDashboard />
      </section>
    </>
  );
}
