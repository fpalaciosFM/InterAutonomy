import { Navbar } from '@/components/Navbar';
import { HeroCarousel } from '@/components/HeroCarousel';
import type { SlideItem } from '@/components/HeroCarousel';
import type { Language } from '@/lib/translations';
import { ContactForm } from '@/components/ContactForm';
import enHome from '../locales/en/home.json';
import esHome from '../locales/es/home.json';
import zhHome from '../locales/zh/home.json';
import enStrategies from '../locales/en/strategies.json';
import esStrategies from '../locales/es/strategies.json';
import zhStrategies from '../locales/zh/strategies.json';

/**
 * Home page component
 * 
 * Main landing page featuring:
 * - Navigation bar with branding and controls
 * - Hero section with call-to-action
 * - Logo showcase section (placeholder for partner/project logos)
 * - Contact form for inquiries
 * - Footer with copyright
 * 
 * @returns {JSX.Element} Home page layout
 */
export default async function HomePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const sp = await Promise.resolve(searchParams as Record<string, string | string[] | undefined> | undefined);
  const langRaw = typeof sp?.lang === 'string' ? sp.lang : Array.isArray(sp?.lang) ? sp.lang[0] : undefined;
  const lang: Language = (langRaw === 'en' || langRaw === 'es' || langRaw === 'zh') ? (langRaw as Language) : 'en';
  const home = lang === 'en' ? enHome : lang === 'zh' ? zhHome : esHome;
  const strategies = lang === 'en' ? enStrategies : lang === 'zh' ? zhStrategies : esStrategies;

  const slidesData: SlideItem[] = [
    { image: 'https://interautonomy.org/wp-content/uploads/2022/12/44.-Sungai-Utik-Case-Photo-scaled.jpg', text: home.hero.slide1?.text ?? strategies.hero.title, align: 'left' },
    { image: 'https://interautonomy.org/wp-content/uploads/2022/12/30-scaled.jpg', heading: home.hero.slide2.heading, subheading: home.hero.slide2.subheading, align: 'right' },
    { image: 'https://interautonomy.org/wp-content/uploads/2022/12/43.-Aldeas-Campesinas-Case-Photo-scaled.jpg', text: home.hero.slide3.text, align: 'left' },
  ];
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />
      {/* Hero Carousel */}
      <HeroCarousel slidesData={slidesData} />

      <section className="py-16 border-y border-slate-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="container mx-auto sm:px-6 lg:px-8 flex flex-wrap justify-center gap-12 items-center">
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
        </div>
      </section>

      <ContactForm lang={lang} />

      <footer className="py-12 text-center opacity-40 text-sm border-t border-slate-100 dark:border-white/5">
        <p>© 2025 INTERautonomy. All rights reserved.</p>
      </footer>
    </main>
  );
}