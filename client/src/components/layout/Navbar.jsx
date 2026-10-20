import { Compass, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Tags, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { logoutUser, selectAuth } from '../../features/auth/authSlice.js';
import { cn } from '../../lib/cn.js';
import Avatar from '../ui/Avatar.jsx';
import { LinkButton } from '../ui/Button.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

const linkStyles = ({ isActive }) =>
  cn(
    'nav-link rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
    isActive ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-100/80 hover:text-ink',
  );

const mobileLinkStyles = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100',
  );

export default function Navbar() {
  const { user, status } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const authed = status === 'authed';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Any navigation closes the mobile menu.
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [mobileOpen]);

  const links = [
    { to: '/explore', label: 'Explore', icon: Compass },
    ...(authed
      ? [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/my-projects', label: 'My projects', icon: FolderKanban },
        ]
      : []),
  ];

  const handleLogout = async () => {
    setMobileOpen(false);
    await dispatch(logoutUser());
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <header className={cn('site-header z-20 border-b border-line', scrolled && 'is-scrolled')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo to={authed ? '/dashboard' : '/'} />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkStyles}>{link.label}</NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {status === 'checking' && <span className="skeleton h-8 w-24 rounded-full" aria-hidden="true" />}

          {authed && (
            <>
              {/* The wrapper owns visibility: a `hidden` class on the button itself would lose to its own inline-flex. */}
              <span className="hidden sm:block">
                <LinkButton to="/projects/new" size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" /> New project
                </LinkButton>
              </span>
              <UserMenu user={user} />
            </>
          )}

          {status === 'guest' && (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">Log in</LinkButton>
              <LinkButton to="/register" size="sm">Sign up</LinkButton>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="mobile-nav max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white px-4 py-3 md:hidden">
          {authed && (
            <div className="mb-2 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-50 to-white p-3 ring-1 ring-brand-100">
              <Avatar name={user.name} src={user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-slate-500">@{user.username}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={mobileLinkStyles}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </NavLink>
            ))}
            {authed && (
              <>
                <NavLink to="/projects/new" className={mobileLinkStyles}><Plus className="h-4 w-4" aria-hidden="true" /> New project</NavLink>
                <NavLink to="/profile/edit" className={mobileLinkStyles}><UserRound className="h-4 w-4" aria-hidden="true" /> Edit profile</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin/skills" className={mobileLinkStyles}><Tags className="h-4 w-4" aria-hidden="true" /> Manage skills</NavLink>
                )}
                <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
