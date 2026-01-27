import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

import { Navbar } from '@/components/Navbar';
import { sanitizeHtmlFragment } from '@/lib/sanitizeHtml';

type ProjectRowBase = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  external_link_url: string | null;
  location_map_url: string | null;
  translations: Record<
    string,
    {
      title?: string;
      video_url?: string;
      introduction?: string;
      location_map_text?: string;
      short_description?: string;
      external_link_text?: string;
    }
  > | null;
};

type ProjectRowWithMaybeLogo = ProjectRowBase & {
  // Future-proof: this column may not exist yet in DB.
  logo_url?: string | null;
};

type ProjectParagraphRow = {
  id: string;
  project_id: string | null;
  paragraph_key: string;
  sort_order: number;
  translations: Record<string, { body_html?: string }> | null;
};

type ParagraphStrategyRow = {
  paragraph_id: string;
  strategy_id: string;
};

type StrategyRow = {
  id: string;
  slug: string;
  logo_url: string | null;
  translations: Record<string, { title?: string }> | null;
};

function pickLang(searchParams: Record<string, string | string[] | undefined> | undefined): 'es' | 'en' | 'zh' {
  const raw = searchParams?.lang;
  const v = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'es';
  return v === 'en' ? 'en' : v === 'zh' ? 'zh' : 'es';
}

function getVideoEmbedInfo(url: string): { kind: 'iframe' | 'video' | 'none'; src: string } {
  const u = url.trim();
  if (!u) return { kind: 'none', src: '' };

  // YouTube
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (ytMatch) {
    return { kind: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = u.match(/vimeo\.com\/(\d{6,})/);
  if (vimeoMatch) {
    return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Assume direct video URL
  return { kind: 'video', src: u };
}

const CTA_BY_LANG: Record<string, string> = {
  es: '¿Podrían estrategias como estas hacer mi proyecto más autosustentable? Haz clic:',
  en: 'Could strategies like these make my project more self-sustainable? Click:',
  zh: '这些策略能让我的项目更具自我可持续性吗？点击：',
};

const UI_BY_LANG: Record<string, { back: string; notFoundTitle: string; notFoundLead: string }> = {
  es: {
    back: 'Volver a Proyectos',
    notFoundTitle: 'Proyecto no encontrado',
    notFoundLead: 'No existe un proyecto con el slug',
  },
  en: {
    back: 'Back to Projects',
    notFoundTitle: 'Project not found',
    notFoundLead: 'There is no project with slug',
  },
  zh: {
    back: '返回项目列表',
    notFoundTitle: '未找到该项目',
    notFoundLead: '不存在该项目，slug 为',
  },
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

async function getProjectBySlug(slug: string): Promise<ProjectRowWithMaybeLogo | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // `logo_url` may not exist yet in the DB schema. Try selecting it and fall back.
  const { data: dataWithLogo, error: errWithLogo } = await supabase
    .from('projects')
    .select('id, slug, thumbnail_url, external_link_url, location_map_url, translations, logo_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!errWithLogo) return (dataWithLogo as ProjectRowWithMaybeLogo) || null;

  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, thumbnail_url, external_link_url, location_map_url, translations')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase fetch error (project detail):', error);
    return null;
  }

  return (data as ProjectRowWithMaybeLogo) || null;
}

async function getProjectParagraphs(projectId: string): Promise<ProjectParagraphRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('project_paragraphs')
    .select('id, project_id, paragraph_key, sort_order, translations')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Supabase fetch error (project paragraphs):', error);
    return [];
  }

  return (data as ProjectParagraphRow[]) || [];
}

async function getParagraphStrategies(paragraphIds: string[]): Promise<ParagraphStrategyRow[]> {
  if (paragraphIds.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('paragraph_strategies')
    .select('paragraph_id, strategy_id')
    .in('paragraph_id', paragraphIds);

  if (error) {
    console.error('Supabase fetch error (paragraph_strategies):', error);
    return [];
  }

  return (data as ParagraphStrategyRow[]) || [];
}

async function getStrategiesByIds(strategyIds: string[]): Promise<StrategyRow[]> {
  if (strategyIds.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, logo_url, translations')
    .in('id', strategyIds);

  if (error) {
    console.error('Supabase fetch error (strategies by ids):', error);
    return [];
  }

  return (data as StrategyRow[]) || [];
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);
  const lang = pickLang(sp as Record<string, string | string[] | undefined> | undefined);
  const ui = UI_BY_LANG[lang] ?? UI_BY_LANG.es;

  const backHref = `/projects?lang=${encodeURIComponent(lang)}`;

  const project = await getProjectBySlug(slug);
  if (!project) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
        <Navbar />

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-2xl font-bold">{ui.notFoundTitle}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {ui.notFoundLead} <span className="font-mono">{slug}</span>.
          </p>
          <div className="mt-6">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {ui.back}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const t = project.translations?.[lang] || project.translations?.en || {};
  const title = t.title || project.slug;
  const heroUrl = project.thumbnail_url || '';
  const logoUrl = project.logo_url || '';

  const videoUrl =
    t.video_url ||
    project.translations?.en?.video_url ||
    '';
  const video = getVideoEmbedInfo(videoUrl);

  const externalLinkText = t.external_link_text || '';
  const externalLinkUrl = project.external_link_url || '';

  const locationMapText = t.location_map_text || '';
  const locationMapUrl = project.location_map_url || '';

  const shortDescriptionHtml = t.short_description || '';
  const introductionHtml = t.introduction || '';

  const paragraphs = await getProjectParagraphs(project.id);
  const paragraphIds = paragraphs.map((p) => p.id);
  const paragraphStrategies = await getParagraphStrategies(paragraphIds);
  const strategyIds = Array.from(new Set(paragraphStrategies.map((ps) => ps.strategy_id)));
  const strategies = await getStrategiesByIds(strategyIds);

  const strategiesById = new Map<string, StrategyRow>(strategies.map((s) => [s.id, s]));
  const strategyIdsByParagraph = new Map<string, string[]>();
  for (const row of paragraphStrategies) {
    const arr = strategyIdsByParagraph.get(row.paragraph_id) ?? [];
    arr.push(row.strategy_id);
    strategyIdsByParagraph.set(row.paragraph_id, arr);
  }

  const safeShortDescription = sanitizeHtmlFragment(shortDescriptionHtml);
  const safeIntroduction = sanitizeHtmlFragment(introductionHtml);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <header className="relative">
        <div
          className="relative overflow-hidden min-h-[55vh] sm:min-h-[50vh] md:min-h-[45vh] bg-center bg-cover flex items-center py-10"
          style={heroUrl ? { backgroundImage: `url('${heroUrl}')` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/80" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-4 text-center">
            {logoUrl ? (
              <div className="mx-auto w-28 h-28 rounded-full overflow-hidden bg-white/90 dark:bg-slate-800 flex items-center justify-center border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] mb-5">
                <Image src={logoUrl} alt={`${title} logo`} width={96} height={96} className="object-contain" unoptimized={true} />
              </div>
            ) : null}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">{title}</h1>

            <div className="mt-7">
              <Link
                href={backHref}
                className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/40 px-5 py-2 text-sm font-medium backdrop-blur"
              >
                {ui.back}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5">
            <div className="aspect-video bg-slate-200 dark:bg-slate-800">
              {video.kind === 'iframe' ? (
                <iframe
                  className="w-full h-full"
                  src={video.src}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : video.kind === 'video' ? (
                <video className="w-full h-full" controls src={video.src} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">—</div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4 text-left">
            {externalLinkText && externalLinkUrl ? (
              <a
                href={externalLinkUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
              >
                {externalLinkText}
              </a>
            ) : null}

            {locationMapText && locationMapUrl ? (
              <a
                href={locationMapUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
              >
                {locationMapText}
              </a>
            ) : null}

            {safeShortDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeShortDescription }} />
            ) : null}
          </div>
        </div>
      </section>

      {safeIntroduction ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeIntroduction }} />
        </section>
      ) : null}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-10">
          {paragraphs.map((p) => {
            const bodyHtml =
              p.translations?.[lang]?.body_html ||
              p.translations?.en?.body_html ||
              '';

            const safeBody = sanitizeHtmlFragment(bodyHtml);
            const relatedStrategyIds = strategyIdsByParagraph.get(p.id) ?? [];

            return (
              <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
                {safeBody ? (
                  <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeBody }} />
                ) : null}

                <div className="mt-6">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{CTA_BY_LANG[lang]}</p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {relatedStrategyIds.map((sid) => {
                      const s = strategiesById.get(sid);
                      if (!s) return null;

                      const sTitle = s.translations?.[lang]?.title || s.translations?.en?.title || s.slug;
                      const href = `/strategies/${encodeURIComponent(s.slug)}?lang=${encodeURIComponent(lang)}`;

                      return (
                        <Link
                          key={`${p.id}:${sid}`}
                          href={href}
                          className="inline-flex items-center justify-center rounded-full overflow-hidden hover:opacity-90 transition-opacity"
                          title={sTitle}
                        >
                          {s.logo_url ? (
                            <Image
                              src={s.logo_url}
                              alt={sTitle}
                              width={24}
                              height={24}
                              className="block object-cover"
                              unoptimized={true}
                            />
                          ) : (
                            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-200">
                              IA
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
