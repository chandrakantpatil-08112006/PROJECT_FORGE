import { Info, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import Button from './Button.jsx';

/**
 * Modal confirmation built on the native <dialog> element, which gives us focus trapping,
 * Escape-to-close, focus restoration and an accessible modal role without a library.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const danger = tone === 'danger';
  const Icon = danger ? TriangleAlert : Info;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault(); // we control visibility through `open`
        if (!loading) onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !loading) onCancel(); // click on the backdrop
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-line bg-white p-0 text-ink"
    >
      <div className={danger ? 'h-1 bg-gradient-to-r from-rose-500 to-orange-400' : 'h-1 bg-gradient-to-r from-brand-600 via-violet-500 to-cyan-400'} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${danger ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold leading-snug">{title}</h2>
            {description && <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
