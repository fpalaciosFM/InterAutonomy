import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

import { Navbar } from '@/components/Navbar';

type StrategyRow = {
  id: string;
  slug: string;
  logo_url: string | null;
  hero_image_url: string | null;
  translations: Record<string, { title?: string; description_html?: string }> | null;
};

async function getStrategyBySlug(slug: string): Promise<StrategyRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('strategies')
    .select('id, slug, logo_url, hero_image_url, translations')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase fetch error (strategy detail):', error);
    return null;
  }

  return (data as StrategyRow) || null;
}

const SUBTITLE_BY_LANG: Record<string, string> = {
  es: 'una estrategia de autosustentabilidad',
  en: 'a strategy for self-sustainability',
  zh: '自主可持续性策略',
};

const LEAD_BY_LANG: Record<string, string> = {
  es:
    'Mayor autosustentabilidad es mayor autonomía y menos dependencia a financiamientos, conocimientos o decisiones externas. Es mayor capacidad para decidir y negociar con otras iniciativas lo que le conviene a tu proyecto y lo que no. Es lograr una participación más equitativa que te permitirá construir modelos de desarrollo más integrales y más relevantes para todos. Es decir, más sustentables.',
  en:
    'Greater self-sustainability means more autonomy and less dependence on external funding, knowledge, or decisions. It is a stronger capacity to decide and negotiate with other initiatives what benefits your project and what does not. It enables fairer participation so you can build more comprehensive and relevant development models for everyone — in other words, more sustainable.',
  zh:
    '更高的自主可持续性意味着更强的自主性、更少依赖外部资金、知识或决策。它意味着更强的能力去判断并与其他倡议协商哪些对你的项目有利、哪些不利。它实现更公平的参与，从而构建更完整、更贴近所有人的发展模式。换句话说，更可持续。',
};

const UI_BY_LANG: Record<string, { back: string; notFoundTitle: string; notFoundLead: string; noContent: string }> = {
  es: {
    back: 'Volver a Estrategias',
    notFoundTitle: 'Estrategia no encontrada',
    notFoundLead: 'No existe una estrategia con el slug',
    noContent: 'No hay contenido disponible para esta estrategia.',
  },
  en: {
    back: 'Back to Strategies',
    notFoundTitle: 'Strategy not found',
    notFoundLead: 'There is no strategy with slug',
    noContent: 'No content available for this strategy.',
  },
  zh: {
    back: '返回策略列表',
    notFoundTitle: '未找到该策略',
    notFoundLead: '不存在该策略，slug 为',
    noContent: '此策略暂无可用内容。',
  },
};

function pickLang(searchParams: Record<string, string | string[] | undefined> | undefined): 'es' | 'en' | 'zh' {
  const raw = searchParams?.lang;
  const v = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'es';
  return v === 'en' ? 'en' : v === 'zh' ? 'zh' : 'es';
}

export default async function StrategyDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  // Next.js can provide params/searchParams as Promises in some runtimes.
  const { slug } = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);
  const lang = pickLang(sp);
  const ui = UI_BY_LANG[lang] ?? UI_BY_LANG.es;

  const backHref = `/strategies?lang=${encodeURIComponent(lang)}`;

  const strategy = await getStrategyBySlug(slug);
  if (!strategy) {
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

  const title =
    strategy.translations?.[lang]?.title ||
    strategy.translations?.en?.title ||
    strategy.slug;

  const descriptionHtml =
    strategy.translations?.[lang]?.description_html ||
    strategy.translations?.en?.description_html ||
    '';

  const heroUrl = strategy.hero_image_url || '';
  const logoUrl = strategy.logo_url || '';

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />

      <header className="relative">
        <div
          className="relative overflow-hidden min-h-[60vh] sm:min-h-[55vh] md:min-h-[48vh] bg-center bg-cover flex items-center py-10"
          style={heroUrl ? { backgroundImage: `url('${heroUrl}')` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/80" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-4 text-center">
            {logoUrl ? (
              <div className="mx-auto w-28 h-28 rounded-full overflow-hidden bg-white/90 dark:bg-slate-800 flex items-center justify-center border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] mb-5">
                <Image
                  src={logoUrl}
                  alt={`${title} logo`}
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            ) : null}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              {title}
            </h1>
            <p className="mt-2 text-sm text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)]">{SUBTITLE_BY_LANG[lang]}</p>
            <p className="mt-6 max-w-3xl mx-auto text-white/90 text-sm leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)]">
              {LEAD_BY_LANG[lang]}
            </p>

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

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert">
        {descriptionHtml ? (
          <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-300">{ui.noContent}</p>
        )}
      </article>
    </main>
  );
}
