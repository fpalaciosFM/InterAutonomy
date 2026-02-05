"use client";

import Link from 'next/link';

type ProjectRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
  published_at: string | null;
};

type ActionFn = (formData: FormData) => void | Promise<void>;

export default function AdminProjectsTable({
  projects,
  setProjectStatus,
  softDeleteProject,
  restoreProject,
}: {
  projects: ProjectRow[];
  setProjectStatus: ActionFn;
  softDeleteProject: ActionFn;
  restoreProject: ActionFn;
}) {
  return (
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
  );
}
