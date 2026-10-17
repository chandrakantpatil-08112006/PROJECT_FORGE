import { ArrowDownRight, ArrowRight, ArrowUpRight, Code2, Lightbulb, Users, WandSparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import ProjectCard, { ProjectCardSkeleton } from '../../components/common/ProjectCard.jsx';
import { LinkButton } from '../../components/ui/Button.jsx';
import { selectAuth } from '../../features/auth/authSlice.js';
import { useListProjectsQuery } from '../../features/projects/projectsApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const steps = [
  { icon: Lightbulb, number: '01', title: 'Bring your big idea', text: 'Got a spark? Turn it into a project and tell the world what you want to build.' },
  { icon: Users, number: '02', title: 'Find your people', text: 'Meet curious builders with the skills and energy your project needs.' },
  { icon: Code2, number: '03', title: 'Make it real', text: 'Share the work, learn as a team, and ship something you are proud of.' },
];

export default function Landing() {
  useDocumentTitle();
  const { status } = useSelector(selectAuth);
  const { data, isLoading, isError } = useListProjectsQuery({ limit: 3 });
  const projects = data?.items ?? [];

  return (
    <div className="landing-page space-y-20 pb-8 sm:space-y-24">
      <section className="hero-panel relative isolate overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="hero-copy">
            <div className="eyebrow-pill"><WandSparkles className="h-4 w-4" /> Your next great collaboration starts here</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
              Big ideas need <span className="hero-highlight">good company.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-indigo-100 sm:text-xl">
              Find your people, bring your skills together, and make something real. Your next project team is one hello away.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton to="/explore" size="lg" className="hero-primary">Explore projects <ArrowRight className="h-4 w-4" /></LinkButton>
              {status === 'authed' ? (
                <LinkButton to="/projects/new" variant="secondary" size="lg" className="hero-secondary">Share an idea <ArrowUpRight className="h-4 w-4" /></LinkButton>
              ) : (
                <LinkButton to="/register" variant="secondary" size="lg" className="hero-secondary">Create your account <ArrowUpRight className="h-4 w-4" /></LinkButton>
              )}
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-indigo-100">
              <span className="flex -space-x-2" aria-hidden="true">
                <span className="mini-avatar bg-rose-300">J</span><span className="mini-avatar bg-amber-300">A</span><span className="mini-avatar bg-teal-300">M</span><span className="mini-avatar bg-violet-300">+</span>
              </span>
              <span>Made for builders who build together</span>
            </div>
          </div>

          <div className="hero-art relative mx-auto w-full max-w-md" aria-label="A preview of a project team workspace">
            <div className="floating-spark spark-one">✳</div><div className="floating-spark spark-two">✦</div>
            <div className="project-window">
              <div className="window-top"><span /><span /><span /><div className="ml-auto text-xs font-semibold text-slate-400">THE GOOD STUFF</div></div>
              <div className="window-content">
                <div className="flex items-center justify-between"><span className="workspace-label">WEEKEND PROJECT</span><span className="live-dot">● LIVE</span></div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">A little more<br />community, please.</h2>
                <p className="mt-2 text-sm text-slate-500">A neighborhood app for sharing the good stuff.</p>
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-indigo-50 p-3">
                  <div className="code-tile"><Code2 className="h-5 w-5" /></div>
                  <div><p className="text-sm font-semibold text-slate-800">Frontend developer</p><p className="mt-0.5 text-xs text-slate-500">React · 2 open spots</p></div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-indigo-500" />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex -space-x-2"><span className="mini-avatar bg-rose-300">J</span><span className="mini-avatar bg-amber-300">A</span><span className="mini-avatar bg-teal-300">M</span></div>
                  <span className="text-xs font-medium text-slate-500">3 kind humans building</span>
                </div>
              </div>
            </div>
            <div className="floating-note"><span className="note-icon">✦</span><span><strong>Good things happen</strong><br />when skills meet ideas.</span></div>
          </div>
        </div>
        <a className="hero-scroll" href="#how-it-works"><ArrowDownRight className="h-4 w-4" /> How it works</a>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-28">
        <div className="section-heading text-center">
          <span className="section-kicker">A better way to build</span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">From “what if?” to “we did it.”</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">The best projects happen when the right people find each other.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <article className="step-card" key={number}>
              <div className="flex items-center justify-between"><span className="step-icon"><Icon className="h-5 w-5" /></span><span className="step-number">{number}</span></div>
              <h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent" className="recent-section">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><span className="section-kicker">Fresh ideas, open doors</span><h2 id="recent" className="mt-2 text-3xl font-bold">Projects looking for you</h2></div>
          <Link to="/explore" className="see-all-link">Explore all projects <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <ProjectCardSkeleton key={i} />)}</div>
        ) : isError || projects.length === 0 ? (
          <div className="empty-projects"><span className="empty-spark">✦</span><p className="font-semibold">{isError ? "Projects couldn't be loaded right now." : 'Your next favorite project is just around the corner.'}</p>{!isError && <p className="mt-1 text-sm text-slate-600">Be the first to share an idea and invite your future team.</p>}<LinkButton to={status === 'authed' ? '/projects/new' : '/register'} className="mt-5">Start something <ArrowRight className="h-4 w-4" /></LinkButton></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
        )}
      </section>
    </div>
  );
}
