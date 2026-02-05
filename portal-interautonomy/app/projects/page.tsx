import { createClient } from '@supabase/supabase-js';

import { Hero } from '../../components/Hero';
import { Navbar } from '@/components/Navbar';
import ProjectsGridNoSSR from '@/components/public/ProjectsGridNoSSR';
import StrategyCheckboxDropdown from '@/components/public/StrategyCheckboxDropdown';

type ProjectRow = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
  updated_at?: string;
  translations: Record<string, { title?: string; short_description?: string }> | null;
};

type StrategyOption = {
  id: string;
  slug: string;
  translations: Record<string, { title?: string }> | null;
};

type ParagraphStrategyWithProjectRow = {
  strategy_id: string;
  project_paragraphs: { project_id: string | null } | Array<{ project_id: string | null }> | null;
};

function getSupabaseAnon() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

async function getProjects(): Promise<ProjectRow[]> {
  const supabase = getSupabaseAnon();
  if (!supabase) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — skipping Supabase fetch.');
    return [];
  }

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

async function getPublishedStrategies(): Promise<StrategyOption[]> {
  const supabase = getSupabaseAnon();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, translations')
    .order('slug', { ascending: true });

  if (error) {
    console.error('Supabase fetch error (strategies for filter):', error);
    return [];
  }

  return (data as StrategyOption[]) || [];
}

async function resolveStrategyIdsBySlug(slugs: string[]): Promise<{ ids: string[]; bySlug: Map<string, string> }> {
  const uniqSlugs = Array.from(new Set(slugs.map((s) => s.trim()).filter(Boolean)));
  if (uniqSlugs.length === 0) return { ids: [], bySlug: new Map() };

  const supabase = getSupabaseAnon();
  if (!supabase) return { ids: [], bySlug: new Map() };

  const { data, error } = await supabase.from('strategies').select('id, slug').in('slug', uniqSlugs);
  if (error) {
    console.error('Supabase fetch error (resolve strategies):', error);
    return { ids: [], bySlug: new Map() };
  }

  const bySlug = new Map<string, string>();
  const ids: string[] = [];
  for (const row of (data as Array<{ id: string; slug: string }>) || []) {
    bySlug.set(row.slug, row.id);
    ids.push(row.id);
  }
  return { ids, bySlug };
}

async function getProjectIdsForStrategyIds(strategyIds: string[]): Promise<Set<string>> {
  if (strategyIds.length === 0) return new Set();
  const supabase = getSupabaseAnon();
  if (!supabase) return new Set();

  const projectIds = new Set<string>();

  const { data, error } = await supabase
    .from('paragraph_strategies')
    .select('strategy_id, project_paragraphs ( project_id )')
    .in('strategy_id', strategyIds);

  if (error) {
    console.error('Supabase fetch error (paragraph_strategies for filter):', error);
    return projectIds;
  }

  for (const row of (data as ParagraphStrategyWithProjectRow[]) || []) {
    const pp = row.project_paragraphs;
    const projectId = Array.isArray(pp) ? (pp[0]?.project_id ?? null) : (pp?.project_id ?? null);
    if (projectId) projectIds.add(projectId);
  }

  return projectIds;
}

async function getProjectIdsContainingAllStrategies(strategyIds: string[]): Promise<Set<string>> {
  const uniqIds = Array.from(new Set(strategyIds.filter(Boolean)));
  if (uniqIds.length === 0) return new Set();

  const supabase = getSupabaseAnon();
  if (!supabase) return new Set();

  const perProject = new Map<string, Set<string>>();

  const { data, error } = await supabase
    .from('paragraph_strategies')
    .select('strategy_id, project_paragraphs ( project_id )')
    .in('strategy_id', uniqIds);

  if (error) {
    console.error('Supabase fetch error (paragraph_strategies for all filter):', error);
    return new Set();
  }

  for (const row of (data as ParagraphStrategyWithProjectRow[]) || []) {
    const pp = row.project_paragraphs;
    const projectId = Array.isArray(pp) ? (pp[0]?.project_id ?? null) : (pp?.project_id ?? null);
    if (!projectId) continue;
    const set = perProject.get(projectId) ?? new Set<string>();
    set.add(row.strategy_id);
    perProject.set(projectId, set);
  }

  const ok = new Set<string>();
  for (const [projectId, set] of perProject) {
    let hasAll = true;
    for (const requiredId of uniqIds) {
      if (!set.has(requiredId)) {
        hasAll = false;
        break;
      }
    }
    if (hasAll) ok.add(projectId);
  }

  return ok;
}

type SearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(sp: SearchParams | undefined, key: string): string | null {
  const v = sp?.[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

function readSearchParamValues(sp: SearchParams | undefined, key: string): string[] {
  const v = sp?.[key];
  if (typeof v === 'string') return v ? [v] : [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && Boolean(x));
  return [];
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
  {
    filterTitle: string;
    searchLabel: string;
    sortLabel: string;
    apply: string;
    reset: string;
    searchPlaceholder: string;
    showing: (n: number) => string;
  }
> = {
  es: {
    filterTitle: 'Buscar y ordenar',
    searchLabel: 'Buscar',
    sortLabel: 'Orden',
    apply: 'Aplicar',
    reset: 'Restablecer',
    searchPlaceholder: 'Busca por título o slug',
    showing: (n) => `Mostrando ${n} proyecto${n === 1 ? '' : 's'}`,
  },
  en: {
    filterTitle: 'Search & sort',
    searchLabel: 'Search',
    sortLabel: 'Sort',
    apply: 'Apply',
    reset: 'Reset',
    searchPlaceholder: 'Search by title or slug',
    showing: (n) => `Showing ${n} project${n === 1 ? '' : 's'}`,
  },
  zh: {
    filterTitle: '搜索与排序',
    searchLabel: '搜索',
    sortLabel: '排序',
    apply: '应用',
    reset: '重置',
    searchPlaceholder: '按标题或 slug 搜索',
    showing: (n) => `显示 ${n} 个项目`,
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

  const anyStrategySlugs = readSearchParamValues(spObj, 'any_strategies');
  const allStrategySlugs = readSearchParamValues(spObj, 'all_strategies');

  const [strategies, anyResolved, allResolved] = await Promise.all([
    getPublishedStrategies(),
    resolveStrategyIdsBySlug(anyStrategySlugs),
    resolveStrategyIdsBySlug(allStrategySlugs),
  ]);

  const [anyProjectIds, allProjectIds] = await Promise.all([
    anyResolved.ids.length ? getProjectIdsForStrategyIds(anyResolved.ids) : Promise.resolve<Set<string> | null>(null),
    allResolved.ids.length ? getProjectIdsContainingAllStrategies(allResolved.ids) : Promise.resolve<Set<string> | null>(null),
  ]);

  const projectsRaw = await getProjects();

  const qLower = q.toLowerCase();
  const projectsFiltered = projectsRaw.filter((p) => {
    if (q) {
      const title = projectTitle(p, lang).toLowerCase();
      if (!p.slug.toLowerCase().includes(qLower) && !title.includes(qLower)) return false;
    }

    if (anyProjectIds && !anyProjectIds.has(p.id)) return false;
    if (allProjectIds && !allProjectIds.has(p.id)) return false;

    return true;
  });

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
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold">{filterUi.filterTitle}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{filterUi.showing(projects.length)}</p>
          </div>
          <form method="GET" className="mt-4 grid grid-cols-1 lg:grid-cols-6 gap-3 items-end">
            <input type="hidden" name="lang" value={lang} />
            <label className="block lg:col-span-2">
              <span className="block text-sm font-medium">{filterUi.searchLabel}</span>
              <input
                name="q"
                defaultValue={q}
                className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                placeholder={filterUi.searchPlaceholder}
              />
            </label>

            {(() => {
              const opts = strategies
                .slice()
                .sort((a, b) => {
                  const at = a.translations?.[lang]?.title || a.translations?.en?.title || a.slug;
                  const bt = b.translations?.[lang]?.title || b.translations?.en?.title || b.slug;
                  return at.localeCompare(bt) || a.slug.localeCompare(b.slug);
                })
                .map((s) => ({
                  slug: s.slug,
                  label: s.translations?.[lang]?.title || s.translations?.en?.title || s.slug,
                }));

              return (
                <>
                  <StrategyCheckboxDropdown
                    name="any_strategies"
                    label={lang === 'es' ? 'Estrategias (cualquiera)' : lang === 'zh' ? '策略（任意）' : 'Strategies (any)'}
                    placeholder={lang === 'es' ? 'Selecciona…' : lang === 'zh' ? '选择…' : 'Select…'}
                    options={opts}
                    defaultSelected={anyStrategySlugs}
                  />
                  <StrategyCheckboxDropdown
                    name="all_strategies"
                    label={lang === 'es' ? 'Estrategias (todas)' : lang === 'zh' ? '策略（全部）' : 'Strategies (all)'}
                    placeholder={lang === 'es' ? 'Selecciona…' : lang === 'zh' ? '选择…' : 'Select…'}
                    options={opts}
                    defaultSelected={allStrategySlugs}
                  />
                </>
              );
            })()}

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

            <div className="flex items-center gap-3 lg:justify-end">
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
