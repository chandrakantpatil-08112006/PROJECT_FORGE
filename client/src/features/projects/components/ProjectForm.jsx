import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Briefcase, CheckCircle2, Circle, Layers, Lightbulb, TriangleAlert, Users } from 'lucide-react';
import ProjectCard from '../../../components/common/ProjectCard.jsx';
import SectionHeading from '../../../components/common/SectionHeading.jsx';
import Alert from '../../../components/ui/Alert.jsx';
import Button, { LinkButton } from '../../../components/ui/Button.jsx';
import ChoiceGroup from '../../../components/ui/ChoiceGroup.jsx';
import Input from '../../../components/ui/Input.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import SkillPicker from '../../../components/common/SkillPicker.jsx';
import { DIFFICULTIES, LIMITS, PROJECT_CATEGORIES } from '../../../lib/constants.js';
import { applyServerErrors } from '../../../lib/formErrors.js';
import { categoryTheme } from '../../../lib/theme.js';
import { emptyProjectValues, formValuesToPayload, projectSchema } from '../schemas.js';
import RolesEditor from './RolesEditor.jsx';

// Where each field lives, so the error summary can take the person straight to it.
const FIELD_LABELS = {
  title: ['Title', 'basics'],
  summary: ['Short summary', 'basics'],
  description: ['Description', 'basics'],
  bannerUrl: ['Banner image URL', 'basics'],
  category: ['Category', 'kind'],
  difficulty: ['Difficulty', 'kind'],
  expectedDurationWeeks: ['Expected duration', 'scope'],
  teamSize: ['Team size', 'scope'],
  requiredSkills: ['Required skills', 'scope'],
  roles: ['Roles', 'roles'],
};

const CATEGORY_OPTIONS = PROJECT_CATEGORIES.map((item) => {
  const theme = categoryTheme(item.value);
  return { value: item.value, label: item.label, icon: theme.icon, a: theme.from, b: theme.to };
});

const DIFFICULTY_OPTIONS = DIFFICULTIES.map((item, index) => ({
  ...item,
  note: ['Friendly to newcomers', 'Some experience helps', 'For seasoned builders'][index],
  a: ['#10b981', '#f59e0b', '#e11d48'][index],
  b: ['#06b6d4', '#f97316', '#7c3aed'][index],
}));

/**
 * Shared by "Create project" and "Edit project".
 * `onSave(payload, { publish })` must return a promise and throw the normalised API error on failure;
 * field errors from the server are mapped back onto the matching inputs.
 */
export default function ProjectForm({ defaultValues = emptyProjectValues, mode, onSave, cancelTo }) {
  const [formError, setFormError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({ resolver: zodResolver(projectSchema), defaultValues });

  const submit = (publish) =>
    handleSubmit(async (values) => {
      setFormError(null);
      if (publish && values.roles.length === 0) {
        setError('roles', { type: 'manual', message: 'Add at least one role before publishing.' });
        return;
      }
      try {
        await onSave(formValuesToPayload(values), { publish });
      } catch (error) {
        setFormError(applyServerErrors(error, setError));
      }
    });

  const rolesError = errors.roles?.message ?? errors.roles?.root?.message;

  // Everything below only feeds the live preview and checklist; it never touches what is submitted.
  const v = watch();
  const text = (value) => (value ?? '').trim();
  const checklist = [
    { label: 'Give it a clear title', done: text(v.title).length >= LIMITS.PROJECT_TITLE_MIN },
    { label: 'Write a short summary', done: text(v.summary).length >= LIMITS.PROJECT_SUMMARY_MIN },
    { label: 'Describe what you are building', done: text(v.description).length >= LIMITS.PROJECT_DESCRIPTION_MIN },
    { label: 'Choose a category and difficulty', done: Boolean(v.category && v.difficulty) },
    { label: 'Add the skills it needs', done: (v.requiredSkills?.length ?? 0) > 0 },
    { label: 'Define at least one role', done: (v.roles?.length ?? 0) > 0 },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const previewProject = {
    id: 'preview',
    title: text(v.title) || 'Your project title',
    summary: text(v.summary) || 'A short summary appears here so people can tell at a glance what you are building.',
    category: v.category || 'other',
    difficulty: v.difficulty || 'beginner',
    status: 'draft',
    bannerUrl: text(v.bannerUrl),
    requiredSkills: v.requiredSkills ?? [],
    roles: (v.roles ?? []).map((role) => ({ openSlots: Number.isFinite(role?.slots) ? role.slots : 1 })),
    memberCount: 1,
    teamSize: Number.isFinite(v.teamSize) ? v.teamSize : 2,
    expectedDurationWeeks: Number.isFinite(v.expectedDurationWeeks) ? v.expectedDurationWeeks : 0,
    owner: null,
  };

  // After a failed submit, list what needs attention and let the person jump to each item.
  const problems = Object.keys(errors).filter((key) => FIELD_LABELS[key]);
  const goTo = (name) => {
    try { setFocus(name); } catch { /* controlled fields have no input to focus */ }
    document.getElementById(FIELD_LABELS[name][1])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <form onSubmit={submit(false)} noValidate className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21.5rem]">
      <div className="min-w-0 space-y-6">
        {formError && <Alert>{formError}</Alert>}

        {submitCount > 0 && problems.length > 0 && (
          <div role="alert" className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-900 motion-safe:animate-[card-enter_.4s_var(--ease)_both]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">{problems.length === 1 ? 'One thing needs your attention' : `${problems.length} things need your attention`}</p>
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {problems.map((name) => (
                  <li key={name}>
                    <button type="button" onClick={() => goTo(name)} className="font-medium underline decoration-rose-300 underline-offset-4 hover:decoration-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                      {FIELD_LABELS[name][0]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <section id="basics" className="card scroll-mt-24 space-y-4 p-5 sm:p-6" aria-labelledby="basics-title">
          <SectionHeading id="basics-title" step={1} icon={Lightbulb} title="The idea" description="What are you building? This is what people read first." />
          <Input label="Title" required placeholder="e.g. Campus carpool finder" error={errors.title?.message} {...register('title')} />
          <Textarea
            label="Short summary"
            required
            rows={2}
            hint="One or two sentences shown on project cards."
            count={watch('summary')?.length}
            max={LIMITS.PROJECT_SUMMARY_MAX}
            error={errors.summary?.message}
            {...register('summary')}
          />
          <Textarea
            label="Description"
            required
            rows={8}
            hint="What are you building, why, and what would a teammate do? Line breaks are kept."
            count={watch('description')?.length}
            max={LIMITS.PROJECT_DESCRIPTION_MAX}
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="Banner image URL"
            type="url"
            placeholder="https://…"
            hint="Optional. Image upload arrives in a later update, so paste a link for now."
            error={errors.bannerUrl?.message}
            {...register('bannerUrl')}
          />
        </section>

        <section id="kind" className="card scroll-mt-24 space-y-5 p-5 sm:p-6" aria-labelledby="kind-title">
          <SectionHeading id="kind-title" step={2} icon={Layers} title="Category and level" description="Helps the right people find it." />
          <ChoiceGroup legend="Category" required options={CATEGORY_OPTIONS} columns="grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3" error={errors.category?.message} {...register('category')} />
          <ChoiceGroup legend="Difficulty" required options={DIFFICULTY_OPTIONS} columns="grid-cols-1 sm:grid-cols-3" error={errors.difficulty?.message} {...register('difficulty')} />
        </section>

        <section id="scope" className="card scroll-mt-24 space-y-4 p-5 sm:p-6" aria-labelledby="scope-title">
          <SectionHeading id="scope-title" step={3} icon={Users} title="Scope and skills" description="How big is it, and what does it take?" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expected duration (weeks)"
              type="number"
              min={1}
              max={LIMITS.DURATION_WEEKS_MAX}
              required
              error={errors.expectedDurationWeeks?.message}
              {...register('expectedDurationWeeks', { valueAsNumber: true })}
            />
            <Input
              label="Team size"
              type="number"
              min={LIMITS.TEAM_SIZE_MIN}
              max={LIMITS.TEAM_SIZE_MAX}
              required
              hint="Total people including you."
              error={errors.teamSize?.message}
              {...register('teamSize', { valueAsNumber: true })}
            />
          </div>

          <Controller
            control={control}
            name="requiredSkills"
            render={({ field }) => (
              <SkillPicker
                label="Required skills"
                value={field.value}
                onChange={field.onChange}
                max={LIMITS.PROJECT_SKILLS_MAX}
                hint="The technologies and abilities the project needs."
                error={errors.requiredSkills?.message}
              />
            )}
          />
        </section>

        <section id="roles" className="card scroll-mt-24 space-y-4 p-5 sm:p-6" aria-labelledby="roles-title">
          <SectionHeading id="roles-title" step={4} icon={Briefcase} title="Roles" description="The positions people can apply for." />
          <RolesEditor control={control} register={register} errors={errors} error={rolesError} />
        </section>

        <div className="form-actions flex flex-wrap items-center justify-between gap-3">
          <p className="hidden text-sm text-slate-500 sm:block" aria-live="polite">
            <strong className="font-semibold text-ink">{doneCount}/{checklist.length}</strong> steps complete
          </p>
          <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            {cancelTo && <span className="hidden sm:block"><LinkButton to={cancelTo} variant="ghost">Cancel</LinkButton></span>}
            {mode === 'create' ? (
              <>
                <Button className="flex-1 sm:flex-none" variant="secondary" type="submit" loading={isSubmitting}>Save as draft</Button>
                <Button className="flex-1 sm:flex-none" onClick={submit(true)} loading={isSubmitting}>Publish project</Button>
              </>
            ) : (
              <Button className="flex-1 sm:flex-none" type="submit" loading={isSubmitting}>Save changes</Button>
            )}
          </div>
        </div>
      </div>

      <aside aria-label="Live preview" className="space-y-5 lg:sticky lg:top-24">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold">Live preview</h2>
            <span className="live-badge">Updates as you type</span>
          </div>
          <div inert aria-hidden="true">
            <ProjectCard key={previewProject.bannerUrl} project={previewProject} showStatus />
          </div>
        </section>

        <section className="card p-5" aria-labelledby="ready">
          <div className="flex justify-between text-sm">
            <h2 id="ready" className="font-bold">{doneCount === checklist.length ? 'Ready to publish' : 'Getting ready'}</h2>
            <span className="text-slate-500">{doneCount}/{checklist.length}</span>
          </div>
          <div className="progress-track mt-2" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={checklist.length} aria-label="Project completeness">
            <div className="progress-fill transition-[width] duration-500" style={{ width: `${(doneCount / checklist.length) * 100}%`, animation: 'none' }} />
          </div>
          <ul className="mt-3 space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className={`check-row flex items-center gap-2 text-sm ${item.done ? 'is-done line-through' : 'text-slate-700'}`}>
                {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />}
                {item.label}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </form>
  );
}
