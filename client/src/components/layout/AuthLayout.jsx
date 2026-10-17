import { ArrowRight, Code2, Lightbulb, Users } from 'lucide-react';
import { Outlet } from 'react-router';
import Logo from './Logo.jsx';

/** Welcoming split layout shared by login and account creation. */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-top"><Logo /></div>
      <main id="main" className="auth-shell">
        <aside className="auth-story">
          <span className="auth-story-kicker">ProjectForge community</span>
          <h1>Build something<br /><span>worth sharing.</span></h1>
          <p>Find your next collaborator, learn by doing, and turn that idea you can’t stop thinking about into a real project.</p>
          <div className="auth-perks">
            <div><Users /><span>Meet your kind of people</span></div>
            <div><Lightbulb /><span>Find a project that sparks joy</span></div>
            <div><Code2 /><span>Make progress together</span></div>
          </div>
          <div className="auth-story-foot">Good ideas are better together <ArrowRight /></div>
          <span className="auth-decoration auth-decoration-a" /><span className="auth-decoration auth-decoration-b" />
        </aside>
        <section className="auth-card"><Outlet /></section>
      </main>
      <p className="auth-footer">A little progress, made together.</p>
    </div>
  );
}
