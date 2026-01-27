import { createClient } from '@supabase/supabase-js';

import { Hero } from '../../components/Hero';
import { Navbar } from '@/components/Navbar';
import ProjectCard from '../../components/ProjectCard';

type ProjectRow = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
  translations: Record<string, { title?: string; short_description?: string }> | null;
};

async function getProjects(): Promise<ProjectRow[]> {
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
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, thumbnail_url, published_at, translations')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Supabase fetch error (projects):', error);
    return [];
  }

  return (data as ProjectRow[]) || [];
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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const lang = pickLang(sp as Record<string, string | string[] | undefined> | undefined);
  const ui = UI_BY_LANG[lang] ?? UI_BY_LANG.es;

  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <Hero variant="vibrant" title={ui.heroTitle} align="center" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 sm:mt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{ui.pageTitle}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{ui.pageDescription}</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id || p.slug} project={p} lang={lang} />
          ))}
        </section>
      </div>
    </main>
  );
}
