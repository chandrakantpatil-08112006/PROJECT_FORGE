import { Compass, LayoutGrid, List, Search, SearchX, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import ProjectCard, { ProjectCardSkeleton } from '../../components/common/ProjectCard.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Select from '../../components/ui/Select.jsx';
import ProjectFilters from '../../features/projects/components/ProjectFilters.jsx';
import { useListProjectsQuery } from '../../features/projects/projectsApi.js';
import { useSearchSkillsQuery } from '../../features/skills/skillsApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { cn } from '../../lib/cn.js';
import { categoryLabel, difficultyLabel, EXPLORE_STATUS_OPTIONS, PROJECT_CATEGORIES, SORT_OPTIONS } from '../../lib/constants.js';
import { categoryTheme } from '../../lib/theme.js';

const PAGE_SIZE = 12;
const DEFAULTS = { status: 'recruiting', sort: 'newest', match: 'any' };

/** Every filter lives in the URL, so results are shareable, bookmarkable and survive refresh. */
export default function Explore() {
  useDocumentTitle('Explore projects');
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersMounted, setFiltersMounted] = useState(false);
  const [view, setView] = useState('grid');
  const searchRef = useRef(null);

  // Press "/" anywhere (outside a text field) to jump to the search box.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (filtersOpen) {
      setFiltersMounted(true);
      return undefined;
    }
    if (!filtersMounted) return undefined;

    const timeout = window.setTimeout(() => setFiltersMounted(false), 180);
    return () => window.clearTimeout(timeout);
  }, [filtersOpen, filtersMounted]);

  const q = params.get('q') ?? '';
  const values = {
    category: params.get('category') ?? '',
    difficulty: params.get('difficulty') ?? '',
    status: params.get('status') ?? DEFAULTS.status,
    match: params.get('match') ?? DEFAULTS.match,
    sort: params.get('sort') ?? DEFAULTS.sort,
  };
  const page = Math.max(1, Number(params.get('page')) || 1);
  const skillSlugs = (params.get('skills') ?? '').split(',').filter(Boolean);

  /** Merge changes into the URL. Empty/default values are removed; any change but paging resets to page 1. */
  const update = (changes, { replace = false } = {}) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([key, value]) => {
          const isDefault = value === '' || value == null || DEFAULTS[key] === value;
          if (isDefault) next.delete(key);
          else next.set(key, String(value));
        });
        if (!('page' in changes)) next.delete('page');
        return next;
      },
      { replace },
    );
  };

  // Search box: local state for typing, debounced into the URL.
  const [search, setSearch] = useState(q);
  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => {
    if (debouncedSearch.trim() !== q) update({ q: debouncedSearch.trim() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Selected skills are stored as slugs in the URL; look their names up (and remember ones just picked).
  const knownSkills = useRef(new Map());
  const { data: lookup } = useSearchSkillsQuery({ slugs: skillSlugs.join(','), limit: 20 }, { skip: skillSlugs.length === 0 });
  lookup?.items.forEach((skill) => knownSkills.current.set(skill.slug, skill));
  const selectedSkills = skillSlugs.map((slug) => knownSkills.current.get(slug)).filter(Boolean);

  const onSkillsChange = (skills) => {
    skills.forEach((skill) => knownSkills.current.set(skill.slug, skill));
    update({ skills: skills.map((skill) => skill.slug).join(',') });
  };

  const { data, error, isLoading, isFetching, refetch } = useListProjectsQuery({
    q,
    skills: skillSlugs.join(','),
    ...values,
    page,
    limit: PAGE_SIZE,
  });

  const projects = data?.items ?? [];
  const meta = data?.meta;

  const activeFilters = [
    values.category,
    values.difficulty,
    values.status !== DEFAULTS.status,
    skillSlugs.length > 0,
    q,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch('');
    setParams(new URLSearchParams());
  };

  const totalShown = useCountUp(meta?.total ?? 0);
  const activeChips = [
    q && { key: 'q', label: `“${q}”`, clear: () => setSearch('') },
    values.category && { key: 'category', label: categoryLabel(values.category), clear: () => update({ category: '' }) },
    values.difficulty && { key: 'difficulty', label: difficultyLabel(values.difficulty), clear: () => update({ difficulty: '' }) },
    values.status !== DEFAULTS.status && {
      key: 'status',
      label: EXPLORE_STATUS_OPTIONS.find((item) => item.value === values.status)?.label ?? values.status,
      clear: () => update({ status: DEFAULTS.status }),
    },
    ...selectedSkills.map((skill) => ({
      key: `skill-${skill.slug}`,
      label: skill.name,
      clear: () => onSkillsChange(selectedSkills.filter((item) => item.slug !== skill.slug)),
    })),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        icon={Compass}
        title="Explore projects"
        description="Find a project that matches what you can build and what you want to learn."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="banner-search min-w-64 flex-1">
            <label htmlFor="explore-search" className="sr-only">Search projects</label>
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              ref={searchRef}
              id="explore-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, summary or skill"
              aria-keyshortcuts="/"
            />
            {!search && <kbd className="mr-2 hidden shrink-0 rounded-md border border-line bg-slate-50 px-1.5 py-0.5 font-sans text-xs font-semibold text-slate-400 sm:block" aria-hidden="true">/</kbd>}
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {meta && !error && (
            <span className="banner-stat" aria-hidden="true">
              <span className="live-dot" />
              {totalShown} {meta.total === 1 ? 'project' : 'projects'} {activeFilters > 0 ? 'match' : 'to explore'}
            </span>
          )}
        </div>
      </PageHeader>

      <div className="chip-scroll -mt-1 mb-4" role="group" aria-label="Filter by category">
        <button type="button" className="cat-chip" style={{ '--a': '#4f46e5', '--b': '#7c3aed' }} aria-pressed={!values.category} onClick={() => update({ category: '' })}>
          <Sparkles className="h-4 w-4" aria-hidden="true" /> All
        </button>
        {PROJECT_CATEGORIES.map((item) => {
          const theme = categoryTheme(item.value);
          return (
            <button
              key={item.value}
              type="button"
              className="cat-chip"
              style={{ '--a': theme.from, '--b': theme.to }}
              aria-pressed={values.category === item.value}
              onClick={() => update({ category: values.category === item.value ? '' : item.value })}
            >
              <theme.icon className="h-4 w-4" aria-hidden="true" /> {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
          <Button variant="secondary" className="mb-3 w-full lg:hidden" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </Button>
          <div className={`filter-disclosure ${filtersOpen ? 'is-open' : filtersMounted ? 'is-closing' : 'is-hidden hidden'} lg:block`}>
            <ProjectFilters
              values={values}
              skills={selectedSkills}
              onChange={(changes) => update(changes)}
              onSkillsChange={onSkillsChange}
              onClear={clearAll}
              activeCount={activeFilters}
            />
          </div>
        </aside>

        <section aria-label="Results" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {meta && !error ? (
              <p className="text-sm font-semibold text-slate-600" aria-live="polite">
                {meta.total === 0
                  ? 'No projects found'
                  : meta.total <= PAGE_SIZE
                    ? `${meta.total} ${meta.total === 1 ? 'project' : 'projects'} found`
                    : `Showing ${(meta.page - 1) * PAGE_SIZE + 1}–${Math.min(meta.total, meta.page * PAGE_SIZE)} of ${meta.total} projects`}
              </p>
            ) : <span />}
            <div className="flex items-center gap-2">
              <Select aria-label="Sort projects" value={values.sort} onChange={(e) => update({ sort: e.target.value })} className="w-48">
                {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
              <div className="seg" role="group" aria-label="Layout">
                <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {activeChips.map((chip) => (
                <li key={chip.key} className="filter-chip">
                  {chip.label}
                  <button type="button" onClick={chip.clear} aria-label={`Remove filter ${chip.label}`}><X className="h-3 w-3" aria-hidden="true" /></button>
                </li>
              ))}
              {activeChips.length > 1 && (
                <li><button type="button" onClick={clearAll} className="text-xs font-semibold text-slate-500 underline-offset-4 transition-colors hover:text-brand-700 hover:underline">Clear all</button></li>
              )}
            </ul>
          )}

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2" role="status" aria-label="Loading projects">{Array.from({ length: 6 }, (_, i) => <ProjectCardSkeleton key={i} />)}</div>
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} title="Projects couldn't be loaded" />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No projects match"
              description={activeFilters > 0 ? 'Try removing a filter or searching for something broader.' : 'Nothing has been posted yet. Be the first!'}
              action={activeFilters > 0 && <Button variant="secondary" onClick={clearAll}>Clear all filters</Button>}
            />
          ) : (
            <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={isFetching}>
              <div className={cn('stagger grid gap-5', view === 'grid' && 'sm:grid-cols-2')}>
                {projects.map((project) => <ProjectCard key={project.id} project={project} horizontal={view === 'list'} />)}
              </div>
              <Pagination
                className="mt-8"
                page={meta.page}
                totalPages={meta.totalPages}
                onChange={(next) => {
                  update({ page: next });
                  window.scrollTo({ top: 0 });
                }}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
