import React from 'react';
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
type HeroProps = {
    variant?: 'default' | 'vibrant'
    title?: string
    lang?: string
    align?: 'left' | 'center'
}

export const Hero = ({ variant = 'default', title, lang = 'en', align = 'left' }: HeroProps) => {
    const isVibrant = variant === 'vibrant';
    return (
        <section className="relative h-[60vh] flex items-center pt-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
                {/* colorful overlay for vibrant variant, otherwise subtle gradient */}
                <div
                    className={
                        isVibrant
                            ? 'absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 opacity-85 mix-blend-multiply z-20 animate-[pulse_6s_infinite]' 
                            : 'absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-black dark:via-black/80 dark:to-transparent z-10'
                    }
                />
                <Image
                    src={
                        isVibrant
                            ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&blend=111827&sat=50'
                            : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop'
                    }
                    alt="Background"
                    className={
                        isVibrant
                            ? 'w-full h-full object-cover opacity-60 scale-105 brightness-90'
                            : 'w-full h-full object-cover opacity-40 dark:opacity-50 grayscale-[30%]'
                    }
                    fill
                    priority
                    unoptimized
                />
            </div>

            <div className="container mx-auto sm:px-6 lg:px-8 relative z-30">
                <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
                    {
                        // internal translations used when `title` prop not provided
                    }
                    {(() => {
                        const translations: Record<string, string> = {
                            en: 'Self-Sustainability Strategies\nfor Development Initiatives',
                            es: 'Estrategias de Autosostenibilidad\npara Iniciativas de Desarrollo'
                        };
                        const resolved = title ?? translations[lang] ?? translations['en'];
                        return (
                            <h1 className="text-3xl md:text-5xl font-black leading-[1.05] mb-6 tracking-tight text-slate-900 dark:text-white">
                                {resolved.split('\n').map((line, i, arr) => (
                                    <span key={i}>
                                        {line}
                                        {i < arr.length - 1 ? <br /> : null}
                                    </span>
                                ))}
                            </h1>
                        );
                    })()}
                </div>
            </div>
        </section>
    );
}