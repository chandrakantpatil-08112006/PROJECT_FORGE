import { ArrowRight, ClipboardCheck, Code2, Lightbulb, Rocket, Users } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';
import Logo from './Logo.jsx';

const STORIES = {
  '/login': {
    pill: 'Welcome back',
    title: ['Pick up where', 'you left off.'],
    text: 'Your projects, teams and applications are exactly where you left them. Jump back in and keep building.',
    perks: [
      { icon: ClipboardCheck, text: 'Review new applications', from: '#6366f1', to: '#8b5cf6' },
      { icon: Rocket, text: 'Move your projects forward', from: '#f59e0b', to: '#f97316' },
      { icon: Users, text: 'Stay close to your team', from: '#06b6d4', to: '#10b981' },
    ],
  },
  default: {
    pill: 'ProjectForge community',
    title: ['Build something', 'worth sharing.'],
    text: 'Find your next collaborator, learn by doing, and turn that idea you can’t stop thinking about into a real project.',
    perks: [
      { icon: Users, text: 'Meet your kind of people', from: '#6366f1', to: '#8b5cf6' },
      { icon: Lightbulb, text: 'Find a project that sparks joy', from: '#f59e0b', to: '#f97316' },
      { icon: Code2, text: 'Make progress together', from: '#06b6d4', to: '#10b981' },
    ],
  },
};

/** Welcoming split layout shared by login and account creation. */
export default function AuthLayout() {
  const location = useLocation();
  const story = STORIES[location.pathname] ?? STORIES.default;

  return (
    <div className="auth-layout">
      <span className="auth-bg-blob" style={{ left: '-8%', top: '-12%', width: 480, height: 480, background: 'rgb(99 102 241 / .22)' }} aria-hidden="true" />
      <span className="auth-bg-blob" style={{ right: '-10%', bottom: '-14%', width: 520, height: 520, background: 'rgb(6 182 212 / .18)', animationDelay: '-7s' }} aria-hidden="true" />
      <header className="auth-top"><Logo /></header>
      <main id="main" className="auth-shell">
        <aside className="auth-story" aria-label="Why ProjectForge">
          <span className="pill"><span className="live-dot" /> {story.pill}</span>
          <h2 key={location.pathname}>{story.title[0]}<br /><span className="text-aurora">{story.title[1]}</span></h2>
          <p>{story.text}</p>
          <div className="auth-perks">
            {story.perks.map(({ icon: Icon, text, from, to }) => (
              <div className="auth-perk" key={text}>
                <span className="chip-icon" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-indigo-200">Good ideas are better together <ArrowRight className="h-4 w-4" aria-hidden="true" /></div>
        </aside>
        <section key={location.pathname} className="auth-card auth-route-transition"><Outlet /></section>
      </main>
      <footer className="auth-footer">A little progress, made together.</footer>
    </div>
  );
}
