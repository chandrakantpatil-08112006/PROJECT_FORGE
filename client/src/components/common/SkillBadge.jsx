import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { skillTone } from '../../lib/theme.js';

/** A skill chip, tinted by the skill's category. Pass onRemove to make it removable (used in pickers). */
export default function SkillBadge({ skill, onRemove, className }) {
  const tone = skillTone(skill.category);
  return (
    <span
      style={{ '--sk-bg': tone.bg, '--sk-fg': tone.fg, '--sk-bd': tone.bd }}
      className={cn('skill-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
    >
      {skill.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${skill.name}`}
          className="-mr-1.5 rounded-full p-0.5 opacity-70 transition hover:bg-black/10 hover:opacity-100"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
