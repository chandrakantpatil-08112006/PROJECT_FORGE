import { ArrowUpRight, Clock, Gauge, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn.js';
import { categoryLabel, difficultyLabel } from '../../lib/constants.js';
import { formatDuration } from '../../lib/formatters.js';
import { categoryTheme } from '../../lib/theme.js';
import Avatar from '../ui/Avatar.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useState } from 'react';
import ProjectStatusBadge from './ProjectStatusBadge.jsx';
import SkillBadge from './SkillBadge.jsx';

const MAX_SKILLS = 4;

/** Project banner, or a category-coloured placeholder when there is no image (or it fails to load). */
export function ProjectBanner({ project, className }) {
  const [failed, setFailed] = useState(false);
  const theme = categoryTheme(project.category);
  const Icon = theme.icon;

  if (project.bannerUrl && !failed) {
    return (
      <div className={cn('project-banner', className)}>
        <img
          src={project.bannerUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={cn('project-banner flex items-end p-3', className)}
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      aria-hidden="true"
    >
      <span className="banner-grid" />
      <Icon className="banner-art" strokeWidth={1.25} />
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[11px] font-medium text-slate-500"><Icon className="h-3 w-3" aria-hidden="true" />{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const isRecent = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) && Date.now() - time < NEW_WINDOW_MS;
};

/**
 * The whole card is one link (via the title's ::after overlay); anything passed as `footer`
 * sits above the overlay so its buttons stay clickable.
 */
export default function ProjectCard({ project, showStatus = false, footer, horizontal = false }) {
  const openRoles = project.roles?.filter((role) => role.openSlots > 0).length ?? 0;
  const skills = project.requiredSkills ?? [];
  const theme = categoryTheme(project.category);

  return (
    <article
      className={cn('card project-card relative flex flex-col overflow-hidden', horizontal && 'sm:flex-row')}
      onMouseMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
        event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
      }}
    >
      <div className={cn('relative', horizontal && 'sm:w-56 sm:shrink-0')}>
        <ProjectBanner project={project} className={cn('h-36', horizontal && 'sm:h-full sm:min-h-40')} />
        {isRecent(project.publishedAt) && project.status === 'recruiting' && (
          <span className="absolute left-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow-md">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> New
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold" style={{ background: theme.tint, color: theme.ink }}>
            <theme.icon className="h-3 w-3" aria-hidden="true" />
            {categoryLabel(project.category)}
          </span>
          {showStatus ? (
            <ProjectStatusBadge status={project.status} />
          ) : (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold', openRoles > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', openRoles > 0 ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden="true" />
              {openRoles > 0 ? `${openRoles} open ${openRoles === 1 ? 'role' : 'roles'}` : 'No open roles'}
            </span>
          )}
        </div>

        <h3 className="flex items-start justify-between gap-2 text-lg font-bold leading-snug">
          <Link to={`/projects/${project.id}`} className="rounded transition-colors after:absolute after:inset-0 hover:text-brand-700 focus-visible:outline-none">
            {project.title}
          </Link>
          <ArrowUpRight className="card-arrow mt-1 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{project.summary}</p>

        {skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Required skills">
            {skills.slice(0, MAX_SKILLS).map((skill) => (
              <li key={skill.id}><SkillBadge skill={skill} /></li>
            ))}
            {skills.length > MAX_SKILLS && (
              <li className="self-center text-xs font-medium text-slate-500">+{skills.length - MAX_SKILLS} more</li>
            )}
          </ul>
        )}

        <div className="mt-auto space-y-3 border-t border-line pt-4">
          <dl className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,.7fr)] gap-3">
            <Spec icon={Gauge} label="Level" value={difficultyLabel(project.difficulty)} />
            <Spec icon={Clock} label="Duration" value={formatDuration(project.expectedDurationWeeks).replace(/ \(.*\)/, '') || '—'} />
            <Spec icon={Users} label="Team" value={`${project.memberCount}/${project.teamSize}`} />
          </dl>
          {project.teamSize > 0 && (
            <div className="team-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, (project.memberCount / project.teamSize) * 100)}%` }} /></div>
          )}
        </div>

        {project.owner && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Avatar name={project.owner.name} src={project.owner.avatarUrl} size="xs" />
            <span className="truncate">by <span className="font-medium text-slate-800">{project.owner.name}</span></span>
          </div>
        )}
      </div>

      {footer && <div className="relative z-10 flex flex-wrap gap-2 border-t border-line bg-slate-50/80 px-5 py-3">{footer}</div>}
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <Skeleton className="h-36 rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-1.5"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-12 rounded-full" /></div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}
