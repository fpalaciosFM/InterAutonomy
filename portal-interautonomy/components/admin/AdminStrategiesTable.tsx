"use client";

import Link from 'next/link';

type StrategyRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
};

type ActionFn = (formData: FormData) => void | Promise<void>;

export default function AdminStrategiesTable({
  strategies,
  setStrategyStatus,
  softDeleteStrategy,
  restoreStrategy,
}: {
  strategies: StrategyRow[];
  setStrategyStatus: ActionFn;
  softDeleteStrategy: ActionFn;
  restoreStrategy: ActionFn;
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
          {strategies.map((s) => (
            <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-4 py-3 font-mono">{s.slug}</td>
              <td className="px-4 py-3">{s.status}</td>
              <td className="px-4 py-3">{s.deleted_at ? 'yes' : 'no'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/strategies/${encodeURIComponent(s.slug)}`}
                    className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Edit
                  </Link>

                  <form action={setStrategyStatus}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value={s.status === 'published' ? 'draft' : 'published'} />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      {s.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </form>

                  {!s.deleted_at ? (
                    <form action={softDeleteStrategy}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 text-red-700 dark:border-red-900/60 dark:text-red-300 px-3 py-1.5 text-xs hover:bg-red-50/40 dark:hover:bg-red-950/30"
                      >
                        Archive
                      </button>
                    </form>
                  ) : (
                    <form action={restoreStrategy}>
                      <input type="hidden" name="id" value={s.id} />
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
