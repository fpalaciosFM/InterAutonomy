import { createClient } from '@supabase/supabase-js';

import { Hero } from '../../components/Hero';
import { Navbar } from '@/components/Navbar';
import ProjectsGridNoSSR from '@/components/public/ProjectsGridNoSSR';

type ProjectRow = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
  updated_at?: string;
  translations: Record<string, { title?: string; short_description?: string }> | null;
};

async function getProjects(): Promise<ProjectRow[]> {
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
    .from('projects')
    .select('id, slug, thumbnail_url, published_at, updated_at, translations')
    // Ensure deterministic ordering across renders (avoids hydration mismatches on ties).
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true });

  if (error) {
    console.error('Supabase fetch error (projects):', error);
    return [];
  }

  return (data as ProjectRow[]) || [];
}

type SearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParams | undefined, key: string): string | null {
  const v = sp?.[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

type SortKey = 'published_desc' | 'updated_desc' | 'updated_asc' | 'slug_asc' | 'slug_desc' | 'title_asc' | 'title_desc';

function asSortKey(v: string | null): SortKey {
  return v === 'published_desc' || v === 'updated_desc' || v === 'updated_asc' || v === 'slug_asc' || v === 'slug_desc' || v === 'title_asc' || v === 'title_desc'
    ? v
    : 'published_desc';
}

function projectTitle(p: ProjectRow, lang: 'es' | 'en' | 'zh'): string {
  return p.translations?.[lang]?.title || p.translations?.en?.title || p.slug;
}

function pickLang(searchParams: Record<string, string | string[] | undefined> | undefined): 'es' | 'en' | 'zh' {
  const raw = searchParams?.lang;
  const v = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'es';
  return v === 'en' ? 'en' : v === 'zh' ? 'zh' : 'es';
}

const UI_BY_LANG: Record<string, { heroTitle: string; pageTitle: string; pageDescription: string }> = {
  es: {
    heroTitle: 'Proyectos para el cambio',
    pageTitle: 'Proyectos',
    pageDescription: 'Explora proyectos y conoce iniciativas en distintos territorios.',
  },
  en: {
    heroTitle: 'Projects for change',
    pageTitle: 'Projects',
    pageDescription: 'Explore projects and learn about initiatives across territories.',
  },
  zh: {
    heroTitle: '变革项目',
    pageTitle: '项目',
    pageDescription: '探索项目，了解不同地区的倡议。',
  },
};

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const spObj = sp as SearchParams | undefined;
  const lang = pickLang(spObj);
  const ui = UI_BY_LANG[lang] ?? UI_BY_LANG.es;
  const filterUi = FILTER_UI[lang] ?? FILTER_UI.es;

  const q = (readSearchParam(spObj, 'q') ?? '').trim();
  const sortKey = asSortKey(readSearchParam(spObj, 'sort'));

  const projectsRaw = await getProjects();

  const qLower = q.toLowerCase();
  const projectsFiltered = q
    ? projectsRaw.filter((p) => {
        const title = projectTitle(p, lang).toLowerCase();
        return p.slug.toLowerCase().includes(qLower) || title.includes(qLower);
      })
    : projectsRaw;

  const projects = [...projectsFiltered].sort((a, b) => {
    const tie = () => {
      const bySlug = a.slug.localeCompare(b.slug);
      if (bySlug !== 0) return bySlug;
      return a.id.localeCompare(b.id);
    };

    switch (sortKey) {
      case 'updated_asc': {
        const av = a.updated_at ?? '';
        const bv = b.updated_at ?? '';
        const d = av.localeCompare(bv);
        return d !== 0 ? d : tie();
      }
      case 'updated_desc': {
        const av = a.updated_at ?? '';
        const bv = b.updated_at ?? '';
        const d = bv.localeCompare(av);
        return d !== 0 ? d : tie();
      }
      case 'slug_asc':
        return tie();
      case 'slug_desc':
        return -tie();
      case 'title_asc':
        return projectTitle(a, lang).localeCompare(projectTitle(b, lang)) || tie();
      case 'title_desc':
        return projectTitle(b, lang).localeCompare(projectTitle(a, lang)) || tie();
      case 'published_desc':
      default: {
        const av = a.published_at ?? '';
        const bv = b.published_at ?? '';
        const d = bv.localeCompare(av);
        return d !== 0 ? d : tie();
      }
    }
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <Hero variant="vibrant" title={ui.heroTitle} align="center" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 sm:mt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{ui.pageTitle}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{ui.pageDescription}</p>
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
                <option value="published_desc">{lang === 'es' ? 'Publicado (más reciente)' : lang === 'zh' ? '发布时间（最新）' : 'Published (newest)'}</option>
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
              <a href={`/projects?lang=${encodeURIComponent(lang)}`} className="text-sm hover:underline">
                {filterUi.reset}
              </a>
            </div>
          </form>
        </div>

        <ProjectsGridNoSSR projects={projects} lang={lang} />
      </div>
    </main>
  );
}
