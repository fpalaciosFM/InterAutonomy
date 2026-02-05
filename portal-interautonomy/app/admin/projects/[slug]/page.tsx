import Link from 'next/link';

import StorageImageUploadInput from '@/components/admin/StorageImageUploadInput';
import SavedChangesNotice from '@/components/admin/SavedChangesNotice';
import { requireAdmin } from '@/lib/admin';
import { updateProject } from '../../actions';

type ProjectRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  thumbnail_url: string | null;
  external_link_url: string | null;
  location_map_url: string | null;
  gallery_urls: string[] | null;
  translations: Record<
    string,
    {
      title?: string;
      short_description?: string;
      introduction?: string;
      video_url?: string;
      external_link_text?: string;
      location_map_text?: string;
    }
  > | null;
};

const LANGS: Array<'es' | 'en' | 'zh'> = ['es', 'en', 'zh'];

type SearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParams, key: string): string | null {
  const v = sp[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

export default async function AdminProjectEditPage({
  params,
  searchParams,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const { slug } = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams ?? {});
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, status, deleted_at, thumbnail_url, external_link_url, location_map_url, gallery_urls, translations')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Edit project</h1>
        <p className="mt-4 text-red-600 text-sm">{error.message}</p>
      </section>
    );
  }

  const project = data as ProjectRow | null;
  if (!project) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Slug: {slug}</p>
        <div className="mt-6">
          <Link href="/admin/projects" className="text-sm hover:underline">
            Back
          </Link>
        </div>
      </section>
    );
  }

  const galleryText = Array.isArray(project.gallery_urls) ? project.gallery_urls.join('\n') : '';
  const saved = readSearchParam(sp, 'saved') === '1';

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Edit project</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-mono">{project.slug}</span> · status: {project.status} · deleted: {project.deleted_at ? 'yes' : 'no'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="text-sm hover:underline">
            Back
          </Link>
          <Link
            href={`/projects/${encodeURIComponent(project.slug)}?lang=es`}
            className="text-sm hover:underline"
            target="_blank"
          >
            Preview (public)
          </Link>
        </div>
      </div>

      <form action={updateProject} className="mt-8 space-y-8">
        {saved ? (
          <SavedChangesNotice />
        ) : null}
        <input type="hidden" name="id" value={project.id} />

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="font-semibold">Media & links</h2>

          <StorageImageUploadInput
            label="Thumbnail URL"
            name="thumbnail_url"
            defaultValue={project.thumbnail_url ?? ''}
            prefix={`projects/${project.slug}/thumbnail`}
            placeholder="https://..."
          />

          <label className="block">
            <span className="block text-sm font-medium">External link URL</span>
            <input
              name="external_link_url"
              defaultValue={project.external_link_url ?? ''}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Location map URL</span>
            <input
              name="location_map_url"
              defaultValue={project.location_map_url ?? ''}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Gallery URLs (one per line)</span>
            <textarea
              name="gallery_urls"
              defaultValue={galleryText}
              rows={6}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
              placeholder="https://...\nhttps://..."
            />
          </label>
        </div>

        <div className="space-y-6">
          {LANGS.map((lang) => {
            const t = project.translations?.[lang] ?? {};
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
                  <span className="block text-sm font-medium">Short description (HTML allowed)</span>
                  <textarea
                    name={`${lang}_short_description`}
                    defaultValue={t.short_description ?? ''}
                    rows={4}
                    className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-medium">Introduction (HTML allowed)</span>
                  <textarea
                    name={`${lang}_introduction`}
                    defaultValue={t.introduction ?? ''}
                    rows={6}
                    className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-medium">Video URL</span>
                    <input
                      name={`${lang}_video_url`}
                      defaultValue={t.video_url ?? ''}
                      className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                      placeholder="https://youtu.be/..."
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-medium">External link text</span>
                    <input
                      name={`${lang}_external_link_text`}
                      defaultValue={t.external_link_text ?? ''}
                      className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-medium">Location map text</span>
                    <input
                      name={`${lang}_location_map_text`}
                      defaultValue={t.location_map_text ?? ''}
                      className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
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
