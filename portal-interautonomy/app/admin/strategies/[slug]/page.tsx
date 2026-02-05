import Link from 'next/link';

import { requireAdmin } from '@/lib/admin';
import { updateStrategy } from '../../actions';

type StrategyRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  translations: Record<string, { title?: string; description_html?: string }> | null;
};

const LANGS: Array<'es' | 'en' | 'zh'> = ['es', 'en', 'zh'];

export default async function AdminStrategyEditPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const { slug } = await Promise.resolve(params);
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, status, deleted_at, logo_url, hero_image_url, translations')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Edit strategy</h1>
        <p className="mt-4 text-red-600 text-sm">{error.message}</p>
      </section>
    );
  }

  const strategy = data as StrategyRow | null;
  if (!strategy) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Strategy not found</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Slug: {slug}</p>
        <div className="mt-6">
          <Link href="/admin/strategies" className="text-sm hover:underline">
            Back
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Edit strategy</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-mono">{strategy.slug}</span> · status: {strategy.status} · deleted: {strategy.deleted_at ? 'yes' : 'no'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/strategies" className="text-sm hover:underline">
            Back
          </Link>
          <Link
            href={`/strategies/${encodeURIComponent(strategy.slug)}?lang=es`}
            className="text-sm hover:underline"
            target="_blank"
          >
            Preview (public)
          </Link>
        </div>
      </div>

      <form action={updateStrategy} className="mt-8 space-y-8">
        <input type="hidden" name="id" value={strategy.id} />

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="font-semibold">Media</h2>

          <label className="block">
            <span className="block text-sm font-medium">Logo URL</span>
            <input
              name="logo_url"
              defaultValue={strategy.logo_url ?? ''}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Hero image URL</span>
            <input
              name="hero_image_url"
              defaultValue={strategy.hero_image_url ?? ''}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold">Content rules</h2>
          <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1">
            <li>Allowed formatting: bold/italics/underline, lists, headings, links, and <span className="font-mono">&lt;span style=&quot;color:...&quot;&gt;</span></li>
            <li>Disallowed: scripts, iframes, event handlers, arbitrary styles</li>
            <li>HTML is sanitized on save and on public render</li>
          </ul>
        </div>

        <div className="space-y-6">
          {LANGS.map((lang) => {
            const t = strategy.translations?.[lang] ?? {};
            return (
              <div key={lang} className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <h2 className="font-semibold">Translations ({lang})</h2>

                <label className="block">
                  <span className="block text-sm font-medium">Title</span>
                  <input
                    name={`${lang}_title`}
                    defaultValue={t.title ?? ''}
                    className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-medium">Description (HTML allowed)</span>
                  <textarea
                    name={`${lang}_description_html`}
                    defaultValue={t.description_html ?? ''}
                    rows={10}
                    className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
                    placeholder={'<p><strong>Bold</strong> and <span style="color:#ff0000">color</span>.</p>'}
                  />
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">
            Save changes
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">HTML is sanitized on save.</p>
        </div>
      </form>
    </section>
  );
}
