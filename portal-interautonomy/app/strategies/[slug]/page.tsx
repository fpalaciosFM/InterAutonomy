import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { notFound } from 'next/navigation';

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

  const strategy = await getStrategyBySlug(slug);
  if (!strategy) return notFound();

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
          className="h-[60vh] sm:h-[55vh] md:h-[48vh] bg-center bg-cover flex items-center"
          style={heroUrl ? { backgroundImage: `url('${heroUrl}')` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/70" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-4 text-center">
            {logoUrl ? (
              <div className="mx-auto w-28 h-28 rounded-full overflow-hidden bg-white/90 dark:bg-slate-800 flex items-center justify-center border border-white mb-4">
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-white/90">{SUBTITLE_BY_LANG[lang]}</p>
            <p className="mt-6 max-w-3xl mx-auto text-white/90 text-sm leading-relaxed">{LEAD_BY_LANG[lang]}</p>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert">
        {descriptionHtml ? (
          <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-300">No hay contenido disponible para esta estrategia.</p>
        )}
      </article>
    </main>
  );
}
