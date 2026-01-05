import { createClient } from '@supabase/supabase-js';
import StrategyCard from '../../components/StrategyCard';
import { Navbar } from '@/components/Navbar';

// Do NOT create the Supabase client at module evaluation time if env vars are missing.
// Creating it on module load causes a hard crash when NEXT_PUBLIC_SUPABASE_URL is not set.
// We'll create the client lazily inside getStrategies() after validating env vars.

type Strategy = {
  id: string;
  slug: string;
  hero_image?: string;
  logo_url?: string;
  translations?: Record<string, { title?: string }>;
};

async function getStrategies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL — skipping Supabase fetch.');
    return [];
  }

  if (!supabaseKey) {
    console.warn('Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from('strategies').select('*');
  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data as Strategy[];
}

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // `searchParams` may be a Promise in some Next.js routing cases — await it safely.
  const sp = await Promise.resolve(searchParams as Record<string, string | string[] | undefined> | undefined);
  const lang = typeof sp?.lang === 'string' ? sp.lang : Array.isArray(sp?.lang) ? sp.lang[0] : 'es';
  const strategies = await getStrategies();

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Estrategias</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Explora las estrategias disponibles.</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((s) => (
            <StrategyCard key={s.id || s.slug} strategy={s} lang={lang} />
          ))}
        </section>
      </div>
    </main>
  );
}
