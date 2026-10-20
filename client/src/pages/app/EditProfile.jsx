import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, CheckCircle2, Circle, ExternalLink, Globe, Link2, MapPin, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader.jsx';
import SectionHeading from '../../components/common/SectionHeading.jsx';
import SkillBadge from '../../components/common/SkillBadge.jsx';
import SkillPicker from '../../components/common/SkillPicker.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import ChoiceGroup from '../../components/ui/ChoiceGroup.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { selectUser, updateProfile } from '../../features/auth/authSlice.js';
import { profileChecklist } from '../../features/profile/checklist.js';
import { profileSchema } from '../../features/profile/schemas.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { cn } from '../../lib/cn.js';
import { EXPERIENCE_LEVELS, LIMITS, SKILL_CATEGORIES, skillCategoryLabel } from '../../lib/constants.js';
import { applyServerErrors } from '../../lib/formErrors.js';

const LEVEL_OPTIONS = EXPERIENCE_LEVELS.map((level, index) => ({
  ...level,
  note: ['Just getting started', 'Building real things', 'Years of shipping'][index],
  a: ['#10b981', '#f59e0b', '#e11d48'][index],
  b: ['#06b6d4', '#f97316', '#7c3aed'][index],
}));

/** Only ever link to http(s) URLs, whatever has been typed into the form. */
const safeHref = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

export default function EditProfile() {
  useDocumentTitle('Edit profile');
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [formError, setFormError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? '',
      location: user.location ?? '',
      avatarUrl: user.avatarUrl ?? '',
      experienceLevel: user.experienceLevel,
      githubUsername: user.githubUsername ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      portfolioUrl: user.portfolioUrl ?? '',
      skills: user.skills,
    },
  });

  // Warn before a tab close or reload throws away edits.
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const updated = await dispatch(updateProfile({ ...values, skills: values.skills.map((skill) => skill.id) })).unwrap();
      reset({ ...values, skills: updated.skills });
      toast.success('Profile saved');
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  };

  // Everything in the preview and the completeness meter reflects the form as it is being edited.
  const v = watch();
  const skills = v.skills ?? [];
  const checklist = profileChecklist({ ...v, skills });
  const done = checklist.filter((item) => item.done).length;
  const skillGroups = SKILL_CATEGORIES.map((category) => ({ ...category, items: skills.filter((skill) => skill.category === category.value) })).filter((group) => group.items.length > 0);
  const github = v.githubUsername?.trim();
  const links = [
    github && { key: 'github', label: `github.com/${github}`, href: safeHref(`https://github.com/${github}`), icon: AtSign },
    v.linkedinUrl?.trim() && { key: 'linkedin', label: 'LinkedIn', href: safeHref(v.linkedinUrl.trim()), icon: Link2 },
    v.portfolioUrl?.trim() && { key: 'portfolio', label: 'Portfolio', href: safeHref(v.portfolioUrl.trim()), icon: Globe },
  ].filter(Boolean);
  const levelLabel = EXPERIENCE_LEVELS.find((level) => level.value === v.experienceLevel)?.label;

  return (
    <>
      <PageHeader compact icon={UserRound} tone="emerald" title="Edit profile" description="This is what project owners see when you apply." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-6">
          {formError && <Alert>{formError}</Alert>}

          <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="about-title">
            <SectionHeading id="about-title" icon={UserRound} title="About you" description="The basics people see first." />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar name={v.name} src={v.avatarUrl} size="xl" className="self-center sm:self-start" />
              <Input
                className="flex-1"
                label="Profile image URL"
                type="url"
                placeholder="https://…"
                hint="Paste a link to an image. Uploading arrives in a later update."
                error={errors.avatarUrl?.message}
                {...register('avatarUrl')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" required error={errors.name?.message} {...register('name')} />
              <Input label="Location" icon={MapPin} placeholder="City, Country" error={errors.location?.message} {...register('location')} />
            </div>
            <Textarea
              label="Bio"
              rows={4}
              placeholder="What do you like to build? What are you learning?"
              count={v.bio?.length}
              max={LIMITS.BIO_MAX}
              error={errors.bio?.message}
              {...register('bio')}
            />
            <ChoiceGroup legend="Experience level" options={LEVEL_OPTIONS} columns="grid-cols-1 sm:grid-cols-3" error={errors.experienceLevel?.message} {...register('experienceLevel')} />
          </section>

          <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="skills-title">
            <SectionHeading id="skills-title" icon={Sparkles} title="Skills" description="Used to match you with projects and shown to owners when you apply." />
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <SkillPicker
                  label="Your skills"
                  value={field.value}
                  onChange={field.onChange}
                  max={LIMITS.SKILLS_MAX}
                  hint="Pick from the list. These are used to match you with projects."
                  error={errors.skills?.message}
                />
              )}
            />
          </section>

          <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="links-title">
            <SectionHeading id="links-title" icon={Link2} title="Links" description="Where people can see your work." />
            <Input
              label="GitHub username"
              icon={AtSign}
              placeholder="octocat"
              hint="Just the username. We don't verify it yet."
              error={errors.githubUsername?.message}
              {...register('githubUsername')}
            />
            <Input label="LinkedIn URL" icon={Link2} type="url" placeholder="https://www.linkedin.com/in/…" error={errors.linkedinUrl?.message} {...register('linkedinUrl')} />
            <Input label="Portfolio URL" icon={Globe} type="url" placeholder="https://…" error={errors.portfolioUrl?.message} {...register('portfolioUrl')} />
          </section>

          <div className="form-actions flex flex-wrap items-center justify-between gap-3">
            <p className={cn('flex items-center gap-2 text-sm', isDirty ? 'font-semibold text-amber-700' : 'text-slate-500')} aria-live="polite">
              <span className={cn('h-2 w-2 rounded-full', isDirty ? 'bg-amber-500' : 'bg-emerald-500')} aria-hidden="true" />
              {isDirty ? 'You have unsaved changes' : 'All changes saved'}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => { reset(); setFormError(null); }}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Discard
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
            </div>
          </div>
        </div>

        <aside aria-label="Profile preview" className="space-y-5 lg:sticky lg:top-24">
          <section className="card overflow-hidden">
            <div className="profile-cover" />
            <div className="px-5 pb-5">
              <Avatar name={v.name || user.name} src={v.avatarUrl} size="xl" className="-mt-12 ring-4" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="truncate text-xl font-extrabold">{v.name || 'Your name'}</h2>
                <span className="live-badge">Live preview</span>
              </div>
              <p className="text-sm text-slate-500">@{user.username}{levelLabel ? ` · ${levelLabel}` : ''}</p>
              {v.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />{v.location}</p>}
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{v.bio || 'Your bio appears here. Say what you like to build and what you are learning.'}</p>

              {skillGroups.length > 0 && (
                <div className="mt-4 space-y-3" aria-label="Skills">
                  {skillGroups.map((group) => (
                    <div key={group.value}>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{skillCategoryLabel(group.value)}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.items.map((skill) => <li key={skill.id}><SkillBadge skill={skill} /></li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {links.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4 text-xs font-semibold">
                  {links.map(({ key, label, href, icon: Icon }) => (
                    <li key={key}>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                          <Icon className="h-3 w-3" aria-hidden="true" />{label}<ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-500"><Icon className="h-3 w-3" aria-hidden="true" />{label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card p-5" aria-labelledby="strength">
            <div className="flex justify-between text-sm">
              <h2 id="strength" className="font-bold">{done === checklist.length ? 'Profile complete' : 'Profile strength'}</h2>
              <span className="text-slate-500">{done}/{checklist.length}</span>
            </div>
            <div className="progress-track mt-2" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={checklist.length} aria-label="Profile completeness">
              <div className="progress-fill transition-[width] duration-500" style={{ width: `${(done / checklist.length) * 100}%`, animation: 'none' }} />
            </div>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className={cn('check-row flex items-center gap-2 text-sm', item.done ? 'is-done line-through' : 'text-slate-700')}>
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />}
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </form>
    </>
  );
}
