import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useWatch } from 'react-hook-form';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import { LIMITS } from '../../../lib/constants.js';
import { pluralize } from '../../../lib/formatters.js';

// One-click starting points. They only prefill the title; everything stays editable.
const SUGGESTIONS = ['Frontend developer', 'Backend developer', 'UI/UX designer', 'QA tester', 'Project manager'];

/** The list of roles the owner wants to fill (react-hook-form field array). */
export default function RolesEditor({ control, register, errors, error }) {
  const { fields, append, remove, update } = useFieldArray({ control, name: 'roles' });
  const roles = useWatch({ control, name: 'roles' }) ?? [];
  const teamSize = useWatch({ control, name: 'teamSize' });

  const totalSlots = roles.reduce((sum, role) => sum + (Number.isFinite(role?.slots) ? role.slots : 0), 0);
  const room = Number.isFinite(teamSize) ? teamSize - 1 : null;
  const over = room !== null && totalSlots > room;
  const atMax = fields.length >= LIMITS.ROLES_MAX;

  // A new project starts with one blank role; a suggestion should fill it rather than sit beside it.
  const addSuggestion = (title) => {
    const blank = roles.findIndex((role) => !role?.title?.trim() && !role?.description?.trim());
    if (blank >= 0) update(blank, { ...roles[blank], title });
    else append({ title, description: '', slots: 1 });
  };

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Roles you need</legend>
      <p className="text-sm text-slate-500">
        Each role is a position someone can apply for. A role can have several spots.
      </p>

      {room !== null && (
        <div className="rounded-xl border border-line bg-slate-50/60 p-3.5" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Spots planned</span>
            <span className={over ? 'font-bold text-rose-700' : 'text-slate-600'}>
              <strong className={over ? 'text-rose-700' : 'text-ink'}>{pluralize(totalSlots, 'spot')}</strong> of {room} available
            </span>
          </div>
          <div className="team-meter mt-2" aria-hidden="true">
            <span style={{ width: `${room > 0 ? Math.min(100, (totalSlots / room) * 100) : totalSlots > 0 ? 100 : 0}%`, background: over ? 'linear-gradient(90deg,#f43f5e,#e11d48)' : undefined }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Your team size leaves room for {pluralize(room, 'person', 'people')} besides you.</p>
        </div>
      )}

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-500">
          No roles yet. You can save a draft without roles, but you need at least one to publish.
        </p>
      )}

      <ul className="space-y-3">
        {fields.map((field, index) => {
          const roleErrors = errors?.roles?.[index];
          return (
            <li key={field.id} className="role-card space-y-3 rounded-2xl border border-line bg-slate-50/50 p-4">
              {/* Existing roles keep their id so their identity survives edits. */}
              <input type="hidden" {...register(`roles.${index}.id`)} />
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  <span className="role-index" aria-hidden="true">{index + 1}</span>
                  Role {index + 1}
                </span>
                <Button variant="ghost" size="sm" onClick={() => remove(index)} aria-label={`Remove role ${index + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                <Input
                  label="Role title"
                  placeholder="e.g. Frontend developer"
                  error={roleErrors?.title?.message}
                  {...register(`roles.${index}.title`)}
                />
                <Input
                  label="Spots"
                  type="number"
                  min={1}
                  max={LIMITS.ROLE_SLOTS_MAX}
                  error={roleErrors?.slots?.message}
                  {...register(`roles.${index}.slots`, { valueAsNumber: true })}
                />
              </div>
              <Textarea
                label="What will they do?"
                rows={2}
                placeholder="Optional: tasks, tools, expectations"
                error={roleErrors?.description?.message}
                {...register(`roles.${index}.description`)}
              />
            </li>
          );
        })}
      </ul>

      {error && <p className="text-sm font-medium text-rose-700" role="alert">{error}</p>}

      <div className="space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => append({ title: '', description: '', slots: 1 })}
          disabled={atMax}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a role
        </Button>
        {!atMax && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick-add a common role">
            <span className="text-xs font-medium text-slate-500">Quick add:</span>
            {SUGGESTIONS.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => addSuggestion(title)}
                className="skill-add rounded-full px-2.5 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                + {title}
              </button>
            ))}
          </div>
        )}
        {atMax && <p className="text-xs text-slate-500">You&apos;ve reached the limit of {LIMITS.ROLES_MAX} roles.</p>}
      </div>
    </fieldset>
  );
}
