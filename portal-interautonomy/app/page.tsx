import { Navbar } from '@/components/Navbar';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ContactForm } from '@/components/ContactForm';

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
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />
      {/* Hero Carousel */}
      <HeroCarousel />

      <section className="py-16 border-y border-slate-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="container mx-auto sm:px-6 lg:px-8 flex flex-wrap justify-center gap-12 items-center">
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
        </div>
      </section>

      <ContactForm />

      <footer className="py-12 text-center opacity-40 text-sm border-t border-slate-100 dark:border-white/5">
        <p>© 2025 INTERautonomy. All rights reserved.</p>
      </footer>
    </main>
  );
}