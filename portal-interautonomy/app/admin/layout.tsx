import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link href="/admin" className="font-semibold tracking-tight">
            Admin
              </Link>
          <nav className="flex items-center gap-4 text-sm">
                <Link href="/admin/projects" className="hover:underline">
              Projects
                </Link>
                <Link href="/admin/strategies" className="hover:underline">
              Strategies
                </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
