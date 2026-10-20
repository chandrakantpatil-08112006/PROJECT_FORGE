import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router';
import { selectAuth } from '../../features/auth/authSlice.js';
import { PROJECT_CATEGORIES } from '../../lib/constants.js';
import PageSkeleton from '../ui/PageSkeleton.jsx';
import BackToTop from './BackToTop.jsx';
import Navbar from './Navbar.jsx';
import Logo from './Logo.jsx';

const FOOTER_CATEGORIES = PROJECT_CATEGORIES.slice(0, 5);
const headingStyles = 'font-sans text-sm font-semibold tracking-normal text-white';
const linkStyles = 'rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300';

export default function MainLayout() {
  const location = useLocation();
  const { status } = useSelector(selectAuth);
  const authed = status === 'authed';

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="main-content mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6">
        <div key={location.pathname} className="route-transition">
          {/* Lazy pages load inside the shell, so the navbar and footer never disappear mid-navigation. */}
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <footer className="site-footer mt-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">A place to find your next project, meet your next collaborators, and build something together.</p>
            <Link to={authed ? '/projects/new' : '/register'} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
              {authed ? 'Start a project' : 'Join ProjectForge'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <nav aria-label="Footer" className="contents">
            <div>
              <h2 className={headingStyles}>Product</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link className={linkStyles} to="/explore">Explore projects</Link></li>
                <li><Link className={`${linkStyles} inline-flex items-center gap-1`} to="/projects/new">Create a project <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></li>
              </ul>
            </div>
            <div>
              <h2 className={headingStyles}>Browse</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {FOOTER_CATEGORIES.map((item) => (
                  <li key={item.value}><Link className={linkStyles} to={`/explore?category=${item.value}`}>{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={headingStyles}>{authed ? 'Your space' : 'Community'}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {authed ? (
                  <>
                    <li><Link className={linkStyles} to="/dashboard">Dashboard</Link></li>
                    <li><Link className={linkStyles} to="/my-projects">My projects</Link></li>
                    <li><Link className={linkStyles} to="/profile/edit">Edit profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link className={linkStyles} to="/register">Join ProjectForge</Link></li>
                    <li><Link className={linkStyles} to="/login">Log in</Link></li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs sm:px-6">
            <p>© {new Date().getFullYear()} ProjectForge. Built by developers, for developers.</p>
            <a href="#main" className={`${linkStyles} font-semibold`}>Back to top ↑</a>
          </div>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}
