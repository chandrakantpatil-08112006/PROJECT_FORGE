/** Heading for a card section of a long form: numbered, with an icon and a one-line purpose. */
export default function SectionHeading({ id, step, icon: Icon, title, description }) {
  return (
    <header className="flex items-start gap-3.5 border-b border-line pb-4">
      <span className="section-badge" aria-hidden="true">{Icon ? <Icon className="h-5 w-5" /> : step}</span>
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-bold leading-tight">
          {step ? <span className="mr-2 font-display text-sm font-bold text-brand-600">0{step}</span> : null}
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    </header>
  );
}
