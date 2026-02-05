import Link from 'next/link';

import { requireAdmin } from '@/lib/admin';
import { createStrategy, restoreStrategy, setStrategyStatus, softDeleteStrategy } from '../actions';

type StrategyRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
};

export default async function AdminStrategiesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, status, deleted_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-2xl font-bold">Strategies</h1>
        <p className="mt-4 text-red-600 text-sm">{error.message}</p>
      </section>
    );
  }

  const strategies = (data as StrategyRow[]) || [];

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Strategies</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Draft/publish and archive strategies.</p>
        </div>
        <Link href="/admin" className="text-sm hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold">Create new</h2>
        <form action={createStrategy} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            name="slug"
            placeholder="new-strategy-slug"
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
    </section>
  );
}
