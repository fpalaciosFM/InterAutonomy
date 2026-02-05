import Link from 'next/link';

import AdminSignOutButton from './AdminSignOutButton';
import { requireAdmin } from '@/lib/admin';

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Manage projects and strategies.</p>
        </div>
        <AdminSignOutButton />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/projects"
          className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <h2 className="font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create, publish, and archive projects.</p>
        </Link>
        <Link
          href="/admin/strategies"
          className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <h2 className="font-semibold">Strategies</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create, publish, and archive strategies.</p>
        </Link>
      </div>
    </section>
  );
}
