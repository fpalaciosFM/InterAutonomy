"use client";

import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { translations, LANGUAGES, NAV_ROUTES, type Language } from '@/lib/translations';

/**
 * Navigation bar component with multi-language support and theme toggle
 * 
 * Features:
 * - Responsive design with hamburger menu for mobile
 * - Theme switcher (dark/light mode) with localStorage persistence
 * - Language selector (EN/ES/ZH) with dropdown menu
 * - Official InterAutonomy branding
 * - Dynamic navigation links ready for future pages
 * 
 * @component
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    /**
     * Initialize theme on mount from localStorage or system preference
     * Uses useLayoutEffect to prevent flash of unstyled content
     * State updates are batched with requestAnimationFrame to avoid cascading renders
     */
    useLayoutEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
        
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        requestAnimationFrame(() => {
            setIsDark(shouldBeDark);
            setMounted(true);
        });
        // Initialize language from URL (search param) or localStorage
        try {
            const urlLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null;
            const storedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
            const allowed = ['en', 'es', 'zh'] as const;
            if (urlLang && (allowed as readonly string[]).includes(urlLang)) {
                requestAnimationFrame(() => setCurrentLanguage(urlLang as Language));
            } else if (storedLang && (allowed as readonly string[]).includes(storedLang)) {
                requestAnimationFrame(() => setCurrentLanguage(storedLang as Language));
            }
        } catch {
            // ignore
        }
    }, []);

    /**
     * Apply theme changes when user toggles manually
     */
    useEffect(() => {
        if (!mounted) return;
        
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark, mounted]);

    /**
     * Toggle between dark and light themes
     * Persists preference to localStorage
     */
    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    };

    const t = translations[currentLanguage].nav;
    const currentLangData = LANGUAGES.find(l => l.code === currentLanguage);

    const handleLanguageChange = (lang: Language) => {
        setCurrentLanguage(lang);
        setLanguageMenuOpen(false);
        setMobileMenuOpen(false);
        try {
            localStorage.setItem('lang', lang);
        } catch {
            // ignore
        }

        // update URL search param `lang` while preserving other params
        try {
            const sp = new URLSearchParams(window.location.search);
            sp.set('lang', lang);
            const path = typeof window !== 'undefined' ? window.location.pathname : '/';
            router.push(`${path}?${sp.toString()}`);
        } catch {
            // fallback: do nothing
        }
    };

    // Build href preserving existing query params and setting lang
    const buildHref = (href: string) => {
        try {
            const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
            if (currentLanguage) sp.set('lang', currentLanguage);
            const q = sp.toString();
            return q ? `${href}?${q}` : href;
        } catch {
            return href;
        }
    };

    return (
        <nav className="sticky top-0 w-full z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="relative h-10 w-40 flex-shrink-0">
                    <Image
                        src="https://interautonomy.org/wp-content/uploads/2022/10/interautonomy_weblogo_white_oficial.png"
                        alt="InterAutonomy Logo"
                        fill
                        className="object-contain dark:invert-0 invert"
                        priority
                        unoptimized
                    />
                </Link>

                {/* Desktop Navigation - visible only on xl and up */}
                <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">
                    {NAV_ROUTES.map((route) => (
                        <Link
                            key={route.href}
                            href={buildHref(route.href)}
                            className="px-3 py-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                        >
                            {t[route.key]}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle - only visible on desktop (xl and up) */}
                    <button
                        onClick={toggleTheme}
                        className="hidden xl:inline-flex p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle theme"
                    >
                            {!mounted ? (
                                <div className="w-5 h-5" />
                            ) : isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-700" />
                            )}
                    </button>

                    {/* Search - Hidden on mobile */}
                    <button className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <Search className="w-5 h-5 opacity-70" />
                    </button>

                    {/* Language Selector - always visible */}
                    <div className="relative">
                        <button
                            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-medium uppercase">{currentLangData?.name}</span>
                            <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Language Dropdown */}
                        {languageMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setLanguageMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${
                                                currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                                            }`}
                                        >
                                            <span className="font-medium">{lang.name}</span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">{lang.fullName}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="xl:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu (visible en xl y menores) */}
            {mobileMenuOpen && (
                <div className="xl:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-md">
                    <div className="container mx-auto px-6 py-4 space-y-1">
                        {NAV_ROUTES.map((route) => (
                            <Link
                                key={route.href}
                                href={buildHref(route.href)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {t[route.key]}
                            </Link>
                        ))}

                        {/* Mobile Theme Toggle */}
                        <div className="pt-4">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                aria-label={translations[currentLanguage].ui.toggleTheme}
                            >
                                {!mounted ? (
                                    <div className="w-5 h-5" />
                                ) : isDark ? (
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-5 h-5 text-slate-700" />
                                )}
                                <span className="ml-2">{isDark ? translations[currentLanguage].ui.lightMode : translations[currentLanguage].ui.darkMode}</span>
                            </button>
                        </div>

                        {/* Mobile Search */}
                        <div className="pt-4">
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                    <Search className="w-5 h-5 opacity-70" />
                                    {translations[currentLanguage].ui.search}
                                </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};