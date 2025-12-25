import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ContactForm } from '@/components/ContactForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Navbar />
      <Hero />

      {/* Sección de Marcas/Logos */}
      <section className="py-16 border-y border-slate-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="container mx-auto px-6 flex flex-wrap justify-center gap-12 items-center">
          {/* Aquí irán tus logos factorizados */}
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
        </div>
      </section>

      <ContactForm />

      <footer className="py-12 text-center opacity-40 text-sm border-t border-slate-100 dark:border-white/5">
        <p>© 2024 INTERautonomy. All rights reserved.</p>
      </footer>
    </main>
  );
}