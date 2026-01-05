import Image from 'next/image';

type StrategyCardStrategy = {
  slug: string;
  translations?: Record<string, Record<string, string>>;
  hero_image?: string;
  hero_image_url?: string;
  logo_url?: string;
};

export default function StrategyCard({ strategy, lang = 'en' }: { strategy: StrategyCardStrategy; lang?: string }) {
  const title = strategy.translations?.[lang]?.title || strategy.translations?.en?.title || strategy.slug;

  return (
    <article className="group rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-900">
      <div className="relative h-56 bg-slate-200">
        { (strategy.hero_image || strategy.hero_image_url) ? (
          <Image
            src={strategy.hero_image || strategy.hero_image_url}
            alt={title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200" />
        )}

        {/* logo overlay centered horizontally near bottom */}
        {strategy.logo_url && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-20 h-20 rounded-full bg-white/90 dark:bg-slate-800 flex items-center justify-center border border-white z-10">
            <Image src={strategy.logo_url} alt={`${title} logo`} width={48} height={48} className="object-contain" unoptimized={true} />
          </div>
        )}
      </div>

      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
    </article>
  );
}
