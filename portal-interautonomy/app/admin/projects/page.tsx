import Link from 'next/link';

import { requireAdmin } from '@/lib/admin';
import { createProject, restoreProject, setProjectStatus, softDeleteProject } from '../actions';
import AdminProjectsTableNoSSR from '@/components/admin/AdminProjectsTableNoSSR';

type SearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParams, key: string): string | null {
  const v = sp[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

type StatusFilter = 'all' | 'draft' | 'published';
type DeletedFilter = 'active' | 'archived' | 'all';
type SortKey = 'updated_desc' | 'updated_asc' | 'slug_asc' | 'slug_desc' | 'published_desc';

function asStatusFilter(v: string | null): StatusFilter {
  return v === 'draft' || v === 'published' || v === 'all' ? v : 'all';
}

function asDeletedFilter(v: string | null): DeletedFilter {
  return v === 'active' || v === 'archived' || v === 'all' ? v : 'active';
}

function asSortKey(v: string | null): SortKey {
  return v === 'updated_desc' || v === 'updated_asc' || v === 'slug_asc' || v === 'slug_desc' || v === 'published_desc'
    ? v
    : 'updated_desc';
}

type ProjectRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
  published_at: string | null;
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});

  const q = (readSearchParam(sp, 'q') ?? '').trim();
  const statusFilter = asStatusFilter(readSearchParam(sp, 'status'));
  const deletedFilter = asDeletedFilter(readSearchParam(sp, 'deleted'));
  const sortKey = asSortKey(readSearchParam(sp, 'sort'));

  const { supabase } = await requireAdmin();

  let query = supabase.from('projects').select('id, slug, status, deleted_at, updated_at, published_at');

  if (q) query = query.ilike('slug', `%${q}%`);
  if (statusFilter !== 'all') query = query.eq('status', statusFilter);
  if (deletedFilter === 'active') query = query.is('deleted_at', null);
  if (deletedFilter === 'archived') query = query.not('deleted_at', 'is', null);

  switch (sortKey) {
    case 'updated_asc':
      query = query.order('updated_at', { ascending: true }).order('id', { ascending: true });
      break;
    case 'slug_asc':
      query = query.order('slug', { ascending: true }).order('id', { ascending: true });
      break;
    case 'slug_desc':
      query = query.order('slug', { ascending: false }).order('id', { ascending: true });
      break;
    case 'published_desc':
      query = query
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })
        .order('id', { ascending: true });
      break;
    case 'updated_desc':
    default:
      query = query.order('updated_at', { ascending: false }).order('id', { ascending: true });
      break;
  }

  const { data, error } = await query;

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
        <h2 className="font-semibold">Filter & sort</h2>
        <form method="GET" className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <label className="block">
            <span className="block text-sm font-medium">Search (slug)</span>
            <input
              name="q"
              defaultValue={q}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              placeholder="e.g. autonomy"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Deleted</span>
            <select
              name="deleted"
              defaultValue={deletedFilter}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Sort</span>
            <select
              name="sort"
              defaultValue={sortKey}
              className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="updated_desc">Updated (newest)</option>
              <option value="updated_asc">Updated (oldest)</option>
              <option value="published_desc">Published date (newest)</option>
              <option value="slug_asc">Slug (A→Z)</option>
              <option value="slug_desc">Slug (Z→A)</option>
            </select>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
            >
              Apply
            </button>
            <Link href="/admin/projects" className="text-sm hover:underline">
              Reset
            </Link>
          </div>
        </form>
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

      <AdminProjectsTableNoSSR
        projects={projects}
        setProjectStatus={setProjectStatus}
        softDeleteProject={softDeleteProject}
        restoreProject={restoreProject}
      />
    </section>
  );
}
