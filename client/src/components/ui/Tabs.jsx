import { useRef } from 'react';
import { cn } from '../../lib/cn.js';

export const tabId = (prefix, value) => `${prefix}-tab-${value}`;
export const panelId = (prefix) => `${prefix}-panel`;

/**
 * Accessible segmented tabs (roving tabindex, Arrow/Home/End keys). Render the content in an element with
 * `id={panelId(prefix)} role="tabpanel" aria-labelledby={tabId(prefix, value)}`.
 */
export default function Tabs({ prefix, label, tabs, value, onChange, className }) {
  const refs = useRef({});

  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[tabs[next].value]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex max-w-full rounded-2xl border border-line bg-white p-1 shadow-card', className)}>
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => { refs.current[tab.value] = node; }}
            id={tabId(prefix, tab.value)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId(prefix)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25',
              selected ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4" aria-hidden="true" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
