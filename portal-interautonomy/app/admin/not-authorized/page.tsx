import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold">Not authorized</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Your account is signed in, but it is not in the admin allow-list.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          Back to login
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
