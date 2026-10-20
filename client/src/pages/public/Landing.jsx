import { ArrowDown, ArrowRight, Bell, BrainCircuit, ChevronDown, Code2, Compass, LayoutDashboard, Rocket, Target, UserCheck, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import ProjectCard, { ProjectCardSkeleton } from '../../components/common/ProjectCard.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { LinkButton } from '../../components/ui/Button.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { selectAuth } from '../../features/auth/authSlice.js';
import { useListProjectsQuery } from '../../features/projects/projectsApi.js';
import { useSearchSkillsQuery } from '../../features/skills/skillsApi.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { PROJECT_CATEGORIES } from '../../lib/constants.js';
import { categoryTheme, skillTone } from '../../lib/theme.js';

const workflow = [
  { icon: Compass, title: 'Discover', text: 'Browse real projects and find work that matches what you know or want to learn.', a: '#6366f1', b: '#8b5cf6' },
  { icon: Code2, title: 'Build', text: 'Share a clear idea, define the roles, and give your project a place to begin.', a: '#8b5cf6', b: '#d946ef' },
  { icon: Users, title: 'Collaborate', text: 'Bring complementary skills together and make progress as a team.', a: '#10b981', b: '#06b6d4' },
  { icon: Rocket, title: 'Ship', text: 'Move from a promising idea to a finished project you can show with pride.', a: '#f59e0b', b: '#f97316' },
];

const benefits = [
  { icon: Target, text: 'Find projects by skills, category, and experience level', a: '#6366f1', b: '#8b5cf6' },
  { icon: UserCheck, text: 'Showcase your profile and the work you want to do', a: '#10b981', b: '#06b6d4' },
  { icon: LayoutDashboard, text: 'Manage applications, roles, and team membership in one place', a: '#f59e0b', b: '#f97316' },
];

// Shown only until the real skill catalogue has loaded (or if it can't be reached).
const stack = [
  ['React', 'frontend'], ['Node.js', 'backend'], ['Python', 'language'], ['TypeScript', 'language'],
  ['MongoDB', 'database'], ['Figma', 'design'], ['Docker', 'devops'], ['Flutter', 'mobile'],
  ['TensorFlow', 'data_ai'], ['Tailwind CSS', 'frontend'], ['PostgreSQL', 'database'], ['Jest', 'testing'],
  ['Go', 'language'], ['AWS', 'devops'], ['Next.js', 'frontend'], ['Express', 'backend'],
];

const sampleSkills = [['React', 'frontend'], ['Python', 'language'], ['TensorFlow', 'data_ai']];
const sampleRoles = [
  { title: 'Frontend developer', note: '1 of 2 open', filled: 50, color: 'linear-gradient(90deg,#6366f1,#8b5cf6)' },
  { title: 'ML engineer', note: '1 of 1 open', filled: 12, color: 'linear-gradient(90deg,#06b6d4,#10b981)' },
  { title: 'UI designer', note: 'Filled', filled: 100, color: 'linear-gradient(90deg,#10b981,#34d399)' },
];

const faqs = [
  {
    q: 'How do I join a project?',
    a: 'Open any project, choose one of its open roles, tell the owner why you are a good fit, and apply. A pending application can be withdrawn at any time from the project page or your dashboard.',
  },
  {
    q: 'Can I start a project of my own?',
    a: 'Yes. Describe the idea, list the skills it needs and define the roles you are looking for. Save it as a draft while you refine it, then publish when you are ready for applications.',
  },
  {
    q: 'Who can see my draft projects?',
    a: 'Only you. A draft stays private until you publish it, and you can move a published project back to draft whenever you like.',
  },
  {
    q: 'What happens when an owner accepts me?',
    a: 'You join the team for that role and the project appears under "I\'ve joined" in My projects. You can leave a team later if your plans change.',
  },
  {
    q: 'How are skills used?',
    a: 'Skills come from one shared list, so they mean the same thing on every profile and project. You can filter Explore by them and mark the ones that are relevant when you apply.',
  },
];

function Metric({ value, label }) {
  const shown = useCountUp(value);
  return (
    <div className="metric">
      <p className="font-display text-3xl font-extrabold tabular-nums leading-none text-white">{shown}</p>
      <p className="mt-1.5 text-xs font-semibold text-indigo-200/90">{label}</p>
    </div>
  );
}

function StackChip({ name, category, hidden = false }) {
  const tone = skillTone(category);
  return (
    <span className="marquee-chip" style={{ '--sk-bg': tone.bg, '--sk-fg': tone.fg, '--sk-bd': tone.bd }} aria-hidden={hidden || undefined}>
      {name}
    </span>
  );
}

export default function Landing() {
  useDocumentTitle();
  const { status } = useSelector(selectAuth);
  const { data, isLoading, isError } = useListProjectsQuery({ limit: 3 });
  const { data: skillData } = useSearchSkillsQuery({ limit: 24 });
  const projects = data?.items ?? [];

  // Everything shown as a number or a name below comes from the API; nothing is invented.
  const totalProjects = data?.meta?.total ?? 0;
  const totalSkills = skillData?.meta?.total ?? 0;
  const metrics = [
    totalProjects > 0 && { value: totalProjects, label: totalProjects === 1 ? 'project to explore' : 'projects to explore' },
    totalSkills > 0 && { value: totalSkills, label: totalSkills === 1 ? 'skill in the catalogue' : 'skills in the catalogue' },
  ].filter(Boolean);
  const owners = [...new Map(projects.map((project) => project.owner).filter(Boolean).map((owner) => [owner.username ?? owner.name, owner])).values()].slice(0, 4);
  const marqueeSkills = (skillData?.items?.length ?? 0) >= 6 ? skillData.items.map((skill) => [skill.name, skill.category]) : stack;

  return (
    <div className="space-y-20 pb-10 sm:space-y-28">
      <section className="hero rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <span className="hero-blob hero-blob-a" aria-hidden="true" />
        <span className="hero-blob hero-blob-b" aria-hidden="true" />
        <span className="hero-blob hero-blob-c" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="hero-seq">
            <div>
              <span className="pill"><span className="live-dot" /> A home for ambitious side projects</span>
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[3.45rem] xl:text-[3.6rem]">
              Great projects start with <span className="text-aurora">great people.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-indigo-100/90 sm:text-xl">
              Discover ideas worth building, show what you bring, and find collaborators who help turn a plan into a project.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton to="/explore" size="lg" variant="plain" className="hero-cta">Explore projects <ArrowRight className="h-4 w-4" /></LinkButton>
              {status === 'authed' ? (
                <LinkButton to="/projects/new" variant="plain" size="lg" className="hero-ghost">Create a project</LinkButton>
              ) : (
                <LinkButton to="/register" variant="plain" size="lg" className="hero-ghost">Join ProjectForge</LinkButton>
              )}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              {metrics.length > 0 && (
                <dl className="flex gap-8" aria-label="ProjectForge at a glance">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="contents">
                      <dt className="sr-only">{metric.label}</dt>
                      <dd><Metric value={metric.value} label={metric.label} /></dd>
                    </div>
                  ))}
                </dl>
              )}
              {owners.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-indigo-100/90">
                  <span className="flex -space-x-1.5">
                    {owners.map((owner) => <Avatar key={owner.username ?? owner.name} name={owner.name} src={owner.avatarUrl} size="sm" />)}
                  </span>
                  <span>Projects led by builders like {owners[0].name.split(' ')[0]}</span>
                </div>
              )}
            </div>
            <a href="#how-it-works" className="mt-8 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-indigo-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              See how it works <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden="true" />
            </a>
          </div>

          <div className="hero-art relative mx-auto w-full max-w-md" role="img" aria-label="A sample project listing showing open roles, required skills and the team">
            <div className="preview">
              <div className="preview-bar"><span /><span /><span /><div className="ml-auto text-xs font-semibold text-slate-500">Sample project</div></div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="chip-icon h-11 w-11 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#c026d3)' }}><BrainCircuit className="h-5 w-5" /></span>
                    <div>
                      <p className="font-display text-lg font-bold leading-tight">Campus study buddy</p>
                      <p className="text-xs text-slate-500">AI &amp; machine learning</p>
                    </div>
                  </div>
                  <span className="badge status-badge status-recruiting inline-flex items-center text-xs"><span className="status-dot" />Recruiting</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">Match students with study partners based on their courses and free time.</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sampleSkills.map(([name, category]) => {
                    const tone = skillTone(category);
                    return <span key={name} className="skill-badge rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ '--sk-bg': tone.bg, '--sk-fg': tone.fg, '--sk-bd': tone.bd }}>{name}</span>;
                  })}
                </div>
                <div className="mt-5 space-y-3.5">
                  {sampleRoles.map((role) => (
                    <div key={role.title}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{role.title}</span>
                        <span className="text-slate-500">{role.note}</span>
                      </div>
                      <div className="role-track"><div className="role-fill" style={{ width: `${role.filled}%`, background: role.color }} /></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex -space-x-1">
                      {['Asha Rao', 'Ravi Kumar', 'Meera Nair'].map((name) => <Avatar key={name} name={name} size="xs" />)}
                    </span>
                    3 of 5 on the team
                  </div>
                  <span className="btn-primary inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-semibold" aria-hidden="true">Apply to join</span>
                </div>
              </div>
            </div>

            <div className="float-chip float-chip-a -bottom-6 -left-4 hidden sm:flex" aria-hidden="true">
              <span className="chip-icon bg-emerald-100 text-emerald-600"><Target className="h-4 w-4" /></span>
              <span><strong className="block text-slate-900">Great match</strong>Your skills fit this role</span>
            </div>
            <div className="float-chip float-chip-b -right-3 -top-10 hidden sm:flex" aria-hidden="true">
              <span className="chip-icon bg-amber-100 text-amber-600"><Bell className="h-4 w-4" /></span>
              <span><strong className="block text-slate-900">New application</strong>Meera applied as ML engineer</span>
            </div>
          </div>
        </div>
      </section>

      <Reveal as="section" aria-label="Skills teams are looking for">
        <p className="mb-5 text-center text-sm font-semibold text-slate-500">Skills you can bring to a project</p>
        <div className="marquee">
          <div className="marquee-track">
            {marqueeSkills.map(([name, category]) => <StackChip key={name} name={name} category={category} />)}
            {marqueeSkills.map(([name, category]) => <StackChip key={`${name}-copy`} name={name} category={category} hidden />)}
          </div>
        </div>
      </Reveal>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-28">
        <Reveal className="text-center">
          <span className="section-eyebrow">How it works</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">A simple path from idea to impact.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">Find the work. Bring your skills. Build something worth sharing.</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {workflow.map(({ icon: Icon, title, text, a, b }, index) => (
            <Reveal key={title} delay={index * 90}>
              <article className="card step-card h-full p-6" style={{ '--a': a, '--b': b }}>
                <div className="flex items-center justify-between">
                  <span className="step-icon"><Icon className="h-5 w-5" /></span>
                  <span className="font-display text-sm font-bold text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="section-eyebrow">Built by the community</span>
            <h2 id="recent" className="mt-4 text-3xl font-extrabold sm:text-4xl">Find your next project</h2>
            <p className="mt-2 text-slate-600">Explore real opportunities posted by ProjectForge members.</p>
          </div>
          <Link to="/explore" className="see-all-link">Browse all projects <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <ProjectCardSkeleton key={i} />)}</div>
        ) : isError || projects.length === 0 ? (
          <div className="card flex min-h-56 flex-col items-center justify-center border-dashed p-8 text-center">
            <span className="empty-state-icon mb-4 grid h-12 w-12 place-items-center rounded-2xl border bg-white text-brand-600"><Rocket className="h-6 w-6" aria-hidden="true" /></span>
            <p className="font-bold">{isError ? "Projects couldn't be loaded right now." : 'No projects have been posted yet.'}</p>
            {!isError && <p className="mt-1 text-sm text-slate-600">Start with an idea and invite your future collaborators.</p>}
            <LinkButton to={status === 'authed' ? '/projects/new' : '/register'} className="mt-5">{status === 'authed' ? 'Create a project' : 'Get started'} <ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
        ) : (
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
        )}
      </section>

      <section aria-labelledby="categories">
        <Reveal className="mb-8 text-center">
          <span className="section-eyebrow">Browse by category</span>
          <h2 id="categories" className="mt-4 text-3xl font-extrabold sm:text-4xl">Whatever you like to build</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">From web apps to embedded devices, there is a team working on it.</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {PROJECT_CATEGORIES.map((item, index) => {
            const theme = categoryTheme(item.value);
            return (
              <Reveal key={item.value} delay={(index % 5) * 70} className="h-full">
                <Link to={`/explore?category=${item.value}`} className="cat-tile" style={{ '--a': theme.from, '--b': theme.to }}>
                  <theme.icon className="tile-art" strokeWidth={1.25} aria-hidden="true" />
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur"><theme.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="mt-5 block font-display text-base font-bold leading-tight">{item.label}</span>
                  <span className="tile-go mt-1">Browse <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Reveal as="section" className="card grid items-center gap-10 overflow-hidden bg-gradient-to-br from-white via-white to-brand-50 p-7 sm:p-10 lg:grid-cols-[1fr_.9fr] lg:p-14">
        <div>
          <span className="section-eyebrow">Built for the way developers grow</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Your skills deserve a place to go.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-slate-600">A portfolio shows what you’ve done. ProjectForge helps you find what to do next, learn alongside other builders, and make work you can point to.</p>
        </div>
        <ul className="space-y-3">
          {benefits.map(({ icon: Icon, text, a, b }) => (
            <li key={text} className="card feature-tile flex items-center gap-4 p-4" style={{ '--a': a, '--b': b }}>
              <span className="chip-icon h-11 w-11 text-white" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold leading-snug text-slate-800">{text}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <section aria-labelledby="faq" className="mx-auto max-w-3xl">
        <Reveal className="mb-8 text-center">
          <span className="section-eyebrow">Good to know</span>
          <h2 id="faq" className="mt-4 text-3xl font-extrabold sm:text-4xl">Questions, answered.</h2>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((item, index) => (
            <Reveal key={item.q} delay={index * 50}>
              <details className="faq">
                <summary>
                  {item.q}
                  <ChevronDown className="faq-chevron h-5 w-5 shrink-0" aria-hidden="true" />
                </summary>
                <p className="faq-body px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="cta-band flex flex-col items-start justify-between gap-6 rounded-[1.75rem] px-7 py-10 sm:flex-row sm:items-center sm:px-12 sm:py-12">
        <span className="cta-ring -right-16 -top-24 h-72 w-72" aria-hidden="true" />
        <span className="cta-ring -right-6 -top-14 h-52 w-52" aria-hidden="true" />
        <div>
          <span className="pill">Your next project starts here</span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Ready to make something real?</h2>
          <p className="mt-2 text-indigo-100">Bring the idea. Find the people. Build the thing.</p>
        </div>
        <LinkButton to={status === 'authed' ? '/projects/new' : '/register'} size="lg" variant="plain" className="hero-cta shrink-0">{status === 'authed' ? 'Create a project' : 'Get started'} <ArrowRight className="h-4 w-4" /></LinkButton>
      </Reveal>
    </div>
  );
}
