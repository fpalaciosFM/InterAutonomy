"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
  slug: string;
  label: string;
};

export default function StrategyCheckboxDropdown({
  name,
  label,
  options,
  defaultSelected,
  placeholder,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultSelected: string[];
  placeholder: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const summary = selected.length > 0 ? `${selected.length}` : '';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return Array.from(next);
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="block text-sm font-medium">{label}</span>

      {/* Hidden inputs so the selection submits as repeated query params */}
      {selected.map((slug) => (
        <input key={slug} type="hidden" name={name} value={slug} />
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-left flex items-center justify-between gap-3"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected.length ? '' : 'text-slate-500 dark:text-slate-400'}>
          {selected.length ? `${summary} selected` : placeholder}
        </span>
        <span className="text-slate-500 dark:text-slate-400">▾</span>
      </button>

      {open ? (
        <div
          className="absolute z-50 mt-2 min-w-full w-max max-w-[calc(100vw-2rem)] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
          role="listbox"
        >
          <div className="max-h-64 overflow-auto overflow-x-auto py-2">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">—</div>
            ) : (
              options.map((opt) => (
                <label
                  key={opt.slug}
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSet.has(opt.slug)}
                    onChange={() => toggle(opt.slug)}
                    className="h-4 w-4 shrink-0 flex-none"
                  />
                  <span className="whitespace-nowrap">{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
