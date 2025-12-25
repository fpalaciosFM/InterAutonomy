import { Search, Globe, ChevronDown, Menu } from 'lucide-react';

export const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <span className="text-white dark:text-black font-bold">i</span>
                </div>
                <span className="font-bold text-xl tracking-tighter uppercase">Inter autonomy</span>
            </div>

            <div className="flex items-center gap-6">
                <Search className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100" />
                <div className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase">EN</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </div>
                <Menu className="md:hidden w-6 h-6 cursor-pointer" />
            </div>
        </div>
    </nav>
);