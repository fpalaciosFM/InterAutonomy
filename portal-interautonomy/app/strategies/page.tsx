import { createClient } from '@supabase/supabase-js';
import StrategyCard from '../../components/StrategyCard';
import { Navbar } from '@/components/Navbar';
import { Hero } from '../../components/Hero';
import en from '../../locales/en/strategies.json';
import es from '../../locales/es/strategies.json';
import zh from '../../locales/zh/strategies.json';

// Do NOT create the Supabase client at module evaluation time if env vars are missing.
// Creating it on module load causes a hard crash when NEXT_PUBLIC_SUPABASE_URL is not set.
// We'll create the client lazily inside getStrategies() after validating env vars.

type Strategy = {
  id: string;
  slug: string;
  hero_image_url?: string;
  logo_url?: string;
  translations?: Record<string, { title?: string }>;
  updated_at?: string;
};

async function getStrategies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL — skipping Supabase fetch.');
    return [];
  }

  if (!supabaseKey) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, hero_image_url, logo_url, updated_at, translations')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data as Strategy[];
}

type SearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParams | undefined, key: string): string | null {
  const v = sp?.[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

type SortKey = 'updated_desc' | 'updated_asc' | 'slug_asc' | 'slug_desc' | 'title_asc' | 'title_desc';

function asSortKey(v: string | null): SortKey {
  return v === 'updated_desc' || v === 'updated_asc' || v === 'slug_asc' || v === 'slug_desc' || v === 'title_asc' || v === 'title_desc'
    ? v
    : 'updated_desc';
}

function strategyTitle(s: Strategy, lang: string): string {
  return s.translations?.[lang]?.title || s.translations?.en?.title || s.slug;
}

const FILTER_UI: Record<
  string,
  { filterTitle: string; searchLabel: string; sortLabel: string; apply: string; reset: string; searchPlaceholder: string }
> = {
  es: {
    filterTitle: 'Buscar y ordenar',
    searchLabel: 'Buscar',
    sortLabel: 'Orden',
    apply: 'Aplicar',
    reset: 'Restablecer',
    searchPlaceholder: 'Busca por título o slug',
  },
  en: {
    filterTitle: 'Search & sort',
    searchLabel: 'Search',
    sortLabel: 'Sort',
    apply: 'Apply',
    reset: 'Reset',
    searchPlaceholder: 'Search by title or slug',
  },
  zh: {
    filterTitle: '搜索与排序',
    searchLabel: '搜索',
    sortLabel: '排序',
    apply: '应用',
    reset: '重置',
    searchPlaceholder: '按标题或 slug 搜索',
  },
};

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // `searchParams` may be a Promise in some Next.js routing cases — await it safely.
  const sp = await Promise.resolve(searchParams as Record<string, string | string[] | undefined> | undefined);
  const spObj = sp as SearchParams | undefined;
  const lang = typeof spObj?.lang === 'string' ? spObj.lang : Array.isArray(spObj?.lang) ? spObj.lang[0] : 'es';
  const filterUi = FILTER_UI[lang] ?? FILTER_UI.es;

  const q = (readSearchParam(spObj, 'q') ?? '').trim();
  const sortKey = asSortKey(readSearchParam(spObj, 'sort'));
  const strategies = await getStrategies();

  const locale = lang === 'en' ? en : lang === 'zh' ? zh : es;

  const qLower = q.toLowerCase();
  const filtered = q
    ? strategies.filter((s) => {
        const title = strategyTitle(s, lang).toLowerCase();
        return s.slug.toLowerCase().includes(qLower) || title.includes(qLower);
      })
    : strategies;

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'updated_asc':
        return (a.updated_at ?? '').localeCompare(b.updated_at ?? '');
      case 'updated_desc':
        return (b.updated_at ?? '').localeCompare(a.updated_at ?? '');
      case 'slug_asc':
        return a.slug.localeCompare(b.slug);
      case 'slug_desc':
        return b.slug.localeCompare(a.slug);
      case 'title_asc':
        return strategyTitle(a, lang).localeCompare(strategyTitle(b, lang));
      case 'title_desc':
        return strategyTitle(b, lang).localeCompare(strategyTitle(a, lang));
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <Hero
        variant="vibrant"
        title={locale.hero.title}
        align="center"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 sm:mt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{locale.page.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{locale.page.description}</p>
        </header>

        <div className="mb-8 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold">{filterUi.filterTitle}</h2>
          <form method="GET" className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <input type="hidden" name="lang" value={lang} />
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium">{filterUi.searchLabel}</span>
              <input
                name="q"
                defaultValue={q}
                className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                placeholder={filterUi.searchPlaceholder}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium">{filterUi.sortLabel}</span>
              <select
                name="sort"
                defaultValue={sortKey}
                className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="updated_desc">{lang === 'es' ? 'Actualizado (más reciente)' : lang === 'zh' ? '更新（最新）' : 'Updated (newest)'}</option>
                <option value="updated_asc">{lang === 'es' ? 'Actualizado (más antiguo)' : lang === 'zh' ? '更新（最早）' : 'Updated (oldest)'}</option>
                <option value="title_asc">{lang === 'es' ? 'Título (A→Z)' : lang === 'zh' ? '标题（A→Z）' : 'Title (A→Z)'}</option>
                <option value="title_desc">{lang === 'es' ? 'Título (Z→A)' : lang === 'zh' ? '标题（Z→A）' : 'Title (Z→A)'}</option>
                <option value="slug_asc">{lang === 'es' ? 'Slug (A→Z)' : 'Slug (A→Z)'}</option>
                <option value="slug_desc">{lang === 'es' ? 'Slug (Z→A)' : 'Slug (Z→A)'}</option>
              </select>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
              >
                {filterUi.apply}
              </button>
              <a href={`/strategies?lang=${encodeURIComponent(lang)}`} className="text-sm hover:underline">
                {filterUi.reset}
              </a>
            </div>
          </form>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((s) => (
            <StrategyCard key={s.id || s.slug} strategy={s} lang={lang} />
          ))}
        </section>
      </div>
    </main>
  );
}
