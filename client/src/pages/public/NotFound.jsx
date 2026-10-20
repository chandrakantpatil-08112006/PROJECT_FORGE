import { ArrowRight, Compass, Home, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { LinkButton } from '../../components/ui/Button.jsx';
import { selectAuth } from '../../features/auth/authSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();
  const { status } = useSelector(selectAuth);
  const [query, setQuery] = useState('');

  const search = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden px-2 py-10 text-center">
      <span className="nf-orb left-0 top-4 h-56 w-56 bg-brand-300/40" aria-hidden="true" />
      <span className="nf-orb bottom-0 right-0 h-56 w-56 bg-cyan-300/40" style={{ animationDelay: '-6s' }} aria-hidden="true" />
      <p aria-hidden="true" className="text-aurora select-none font-display text-[7rem] font-extrabold leading-none sm:text-[10rem]" style={{ backgroundImage: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1)' }}>404</p>
      <h1 className="mt-2 text-3xl font-extrabold">We can&apos;t find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">The link may be broken, or the page may have been moved or removed. Try searching for a project instead.</p>

      <form onSubmit={search} role="search" className="mx-auto mt-7 flex max-w-md items-center gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-card focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/15">
        <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <label htmlFor="nf-search" className="sr-only">Search projects</label>
        <input id="nf-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects by title or skill" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400" />
        <button type="submit" className="btn-primary inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25">
          Search <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <LinkButton to="/explore" variant="secondary"><Compass className="h-4 w-4" aria-hidden="true" /> Explore projects</LinkButton>
        {status === 'authed' ? (
          <LinkButton to="/dashboard" variant="secondary"><LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard</LinkButton>
        ) : (
          <LinkButton to="/" variant="secondary"><Home className="h-4 w-4" aria-hidden="true" /> Home</LinkButton>
        )}
      </div>
    </div>
  );
}
