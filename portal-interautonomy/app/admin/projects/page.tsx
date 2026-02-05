import Link from 'next/link';

import { requireAdmin } from '@/lib/admin';
import { createProject, restoreProject, setProjectStatus, softDeleteProject } from '../actions';

type ProjectRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
  published_at: string | null;
};

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, status, deleted_at, updated_at, published_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-4 text-red-600 text-sm">{error.message}</p>
      </section>
    );
  }

  const projects = (data as ProjectRow[]) || [];

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Draft/publish and soft-delete are enforced by RLS.
          </p>
        </div>
        <Link href="/admin" className="text-sm hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold">Create new</h2>
        <form action={createProject} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            name="slug"
            placeholder="new-project-slug"
            className="w-full sm:max-w-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
          >
            Create (draft)
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Slug will be normalized (lowercase, hyphens).
        </p>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="text-left font-medium px-4 py-3">Slug</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Deleted</th>
              <th className="text-left font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-mono">{p.slug}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.deleted_at ? 'yes' : 'no'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/projects/${encodeURIComponent(p.slug)}`}
                      className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      Edit
                    </Link>
                    <form action={setProjectStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value={p.status === 'published' ? 'draft' : 'published'} />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>

                    {!p.deleted_at ? (
                      <form action={softDeleteProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-300 text-red-700 dark:border-red-900/60 dark:text-red-300 px-3 py-1.5 text-xs hover:bg-red-50/40 dark:hover:bg-red-950/30"
                        >
                          Archive
                        </button>
                      </form>
                    ) : (
                      <form action={restoreProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                        >
                          Restore
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
