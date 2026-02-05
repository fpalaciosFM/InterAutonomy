"use client";

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import type { Config } from 'dompurify';

type DOMPurifyInstance = {
  sanitize: (dirty: string, cfg?: Config) => string;
};

function hasSanitize(value: unknown): value is { sanitize: (dirty: string, cfg?: Config) => string } {
  if (typeof value !== 'object' || value === null) return false;
  if (!('sanitize' in value)) return false;
  const candidate = value as { sanitize?: unknown };
  return typeof candidate.sanitize === 'function';
}

type ProjectCardProject = {
  id?: string;
  slug: string;
  thumbnail_url?: string | null;
  translations?: Record<string, { title?: string; short_description?: string }> | null;
};

export default function ProjectCard({ project, lang = 'en' }: { project: ProjectCardProject; lang?: string }) {
  const [open, setOpen] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  const ui =
    lang === 'zh'
      ? { more: '查看更多', close: '关闭' }
      : lang === 'es'
        ? { more: 'Ver más', close: 'Cerrar' }
        : { more: 'Read more', close: 'Close' };

  const title = project.translations?.[lang]?.title || project.translations?.en?.title || project.slug;
  const shortDescriptionHtml = project.translations?.[lang]?.short_description || project.translations?.en?.short_description || '';
  const href = `/projects/${encodeURIComponent(project.slug)}?lang=${encodeURIComponent(lang)}`;

  const imgSrc = project.thumbnail_url || '';

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;

    (async () => {
      try {
        const mod = await import('dompurify');
        const maybeDefault: unknown = (mod as { default?: unknown }).default;

        let purifier: DOMPurifyInstance | null = null;
        if (typeof maybeDefault === 'function') {
          purifier = (maybeDefault as (win: Window) => DOMPurifyInstance)(window);
        } else if (hasSanitize(maybeDefault)) {
          purifier = maybeDefault as unknown as DOMPurifyInstance;
        } else if (hasSanitize(mod)) {
          purifier = mod as unknown as DOMPurifyInstance;
        }

        const config: Config = {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
          ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i,
        };

        const clean = purifier?.sanitize ? purifier.sanitize(shortDescriptionHtml || '', config) : '';

        if (!cancelled) setSanitizedHtml(clean);
      } catch {
        if (!cancelled) setSanitizedHtml('');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, shortDescriptionHtml]);

  const previewText = useMemo(() => {
    if (!shortDescriptionHtml) return '';
    return shortDescriptionHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [shortDescriptionHtml]);

  const showMore = previewText.length > 140;

  return (
    <article
      className={`group rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-900 transition-transform ${open ? '' : 'hover:-translate-y-0.5'}`}
    >
      <Link href={href} className="block">
        <div className="relative h-56 bg-slate-200 dark:bg-slate-800">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>

          {previewText ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">{previewText}</p>
          ) : null}
        </div>
      </Link>

      {showMore ? (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => {
              setSanitizedHtml('');
              setOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {ui.more}
          </button>
        </div>
      ) : null}

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[80]">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => {
                  setOpen(false);
                  setSanitizedHtml('');
                }}
                aria-hidden="true"
              />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
                  <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setSanitizedHtml('');
                      }}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {ui.close}
                    </button>
                  </div>

                  <div className="px-6 py-5 max-h-[70vh] overflow-auto">
                    {sanitizedHtml ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                      />
                    ) : shortDescriptionHtml ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">…</p>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-300">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </article>
  );
}
