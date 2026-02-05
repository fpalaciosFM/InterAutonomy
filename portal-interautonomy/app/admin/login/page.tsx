import { redirect } from 'next/navigation';

import AdminLoginForm from './AdminLoginForm';
import { getIsAdmin } from '@/lib/admin';

export default async function AdminLoginPage() {
  const isAdmin = await getIsAdmin();
  if (isAdmin) redirect('/admin');

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold">Admin login</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Sign in with a magic link. Access is restricted to accounts in the admin allow-list.
      </p>
      <AdminLoginForm />
    </section>
  );
}
