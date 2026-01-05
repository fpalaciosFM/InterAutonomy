import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

/**
 * Hero section component with call-to-action
 * 
 * Features:
 * - Full-height viewport design (85vh)
 * - Background image with gradient overlay
 * - Theme-aware styling (dark/light modes)
 * - Responsive typography
 * - Interactive CTA button with hover effects
 * 
 * @component
 * @example
 * ```tsx
 * <Hero />
 * ```
 */
export const Hero = () => (
    <section className="relative h-[85vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-black dark:via-black/80 dark:to-transparent z-10" />
            <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop"
                alt="Background"
                className="w-full h-full object-cover opacity-40 dark:opacity-50 grayscale-[30%]"
                fill
                priority
                unoptimized
            />
        </div>

        <div className="container mx-auto sm:px-6 lg:px-8 relative z-20">
            <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-8 tracking-tight text-slate-900 dark:text-white">
                    Strengthen your own initiative <br />
                    <span className="text-blue-600 dark:text-blue-400 italic font-serif">by learning</span> from the experience!
                </h1>
                <button className="group flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
                    Explore Strategies
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    </section>
);