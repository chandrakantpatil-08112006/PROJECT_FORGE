import { Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Input from '../../components/ui/Input.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Select from '../../components/ui/Select.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import {
  useCreateSkillMutation,
  useDeleteSkillMutation,
  useSearchSkillsQuery,
  useUpdateSkillMutation,
} from '../../features/skills/skillsApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { LIMITS, SKILL_CATEGORIES, skillCategoryLabel } from '../../lib/constants.js';
import { skillTone } from '../../lib/theme.js';

function CategorySelect(props) {
  return (
    <Select {...props}>
      {props.children}
      {SKILL_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
    </Select>
  );
}

function AddSkillForm() {
  const [createSkill, { isLoading }] = useCreateSkillMutation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const skill = await createSkill({ name: name.trim(), category }).unwrap();
      toast.success(`Added ${skill.name}`);
      setName('');
    } catch (err) {
      setError(err.details?.[0]?.message ?? err.message);
    }
  };

  return (
    <form onSubmit={submit} className="mb-6 card p-4 sm:p-5" aria-label="Add a skill">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Plus className="h-4 w-4 text-brand-600" aria-hidden="true" /> Add a new skill</h2>
      <div className="flex flex-wrap items-end gap-3">
      <Input className="min-w-48 flex-1" label="New skill" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.SKILL_NAME_MAX} error={error} required />
      <CategorySelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-48" />
      <Button type="submit" loading={isLoading} disabled={!name.trim()}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add skill
      </Button>
      </div>
    </form>
  );
}

function SkillRow({ skill, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [error, setError] = useState(null);
  const [updateSkill, { isLoading }] = useUpdateSkillMutation();

  const save = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await updateSkill({ id: skill.id, name: name.trim(), category }).unwrap();
      toast.success('Skill updated');
      setEditing(false);
    } catch (err) {
      setError(err.details?.[0]?.message ?? err.message);
    }
  };

  if (editing) {
    return (
      <li className="p-3">
        <form onSubmit={save} className="flex flex-wrap items-end gap-3">
          <Input className="min-w-48 flex-1" label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.SKILL_NAME_MAX} error={error} />
          <CategorySelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-44" />
          <Button type="submit" size="sm" loading={isLoading}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setName(skill.name); setCategory(skill.category); setError(null); }}>Cancel</Button>
        </form>
      </li>
    );
  }

  return (
    <li className="list-row flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: skillTone(skill.category).fg }} aria-hidden="true" />
        <span className="font-semibold">{skill.name}</span>
        <span className="truncate font-mono text-xs text-slate-500">{skill.slug}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="skill-badge rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ '--sk-bg': skillTone(skill.category).bg, '--sk-fg': skillTone(skill.category).fg, '--sk-bd': skillTone(skill.category).bd }}>{skillCategoryLabel(skill.category)}</span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={`Edit ${skill.name}`}><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(skill)} aria-label={`Delete ${skill.name}`}><Trash2 className="h-4 w-4 text-rose-600" aria-hidden="true" /></Button>
      </div>
    </li>
  );
}

export default function AdminSkills() {
  useDocumentTitle('Manage skills');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const q = useDebounce(search.trim(), 300);

  const { data, error, isLoading, refetch } = useSearchSkillsQuery({ q, category, page, limit: 50 });
  const [deleteSkill, { isLoading: deleting }] = useDeleteSkillMutation();

  const confirmDelete = async () => {
    try {
      await deleteSkill(toDelete.id).unwrap();
      toast.success(`Deleted ${toDelete.name}`);
    } catch (err) {
      toast.error(err.message); // e.g. "used by 3 projects, so it can't be deleted"
    } finally {
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader compact icon={Tags} tone="rose" title="Manage skills" description="The predefined list people choose from on profiles and projects." />
      <AddSkillForm />

      <div className="mb-4 space-y-3">
        <Input label="Search" icon={Search} type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Filter by name" />
        <div className="chip-scroll -mx-1" role="group" aria-label="Filter by category">
          <button type="button" className="cat-chip" aria-pressed={category === ''} onClick={() => { setCategory(''); setPage(1); }}>All categories</button>
          {SKILL_CATEGORIES.map((item) => (
            <button key={item.value} type="button" className="cat-chip" aria-pressed={category === item.value} onClick={() => { setCategory(item.value); setPage(1); }}>{item.label}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2" role="status" aria-label="Loading skills">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Tags} title="No skills found" description="Try a different search, or add the skill above." />
      ) : (
        <>
          <p className="mb-2 text-sm font-semibold text-slate-600" aria-live="polite">{data.meta.total} {data.meta.total === 1 ? 'skill' : 'skills'}</p>
          <ul className="divide-y divide-line card overflow-hidden">
            {data.items.map((skill) => <SkillRow key={skill.id} skill={skill} onDelete={setToDelete} />)}
          </ul>
          <Pagination className="mt-6" page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete "${toDelete?.name}"?`}
        description="Skills that projects or profiles use can't be deleted; rename them instead."
        confirmLabel="Delete skill"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
