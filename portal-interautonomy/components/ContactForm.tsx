import { Send } from 'lucide-react';

/**
 * Contact form component for user inquiries
 * 
 * Features:
 * - Responsive two-column layout
 * - Theme-aware styling
 * - Accessible form elements
 * - Visual feedback on focus
 * 
 * @component
 * @example
 * ```tsx
 * <ContactForm />
 * ```
 * 
 * @todo Connect to backend API or email service
 * @todo Add form validation
 * @todo Implement success/error states
 */
export const ContactForm = () => (
    <section className="py-24 container mx-auto px-6">
        <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[3rem] p-12 md:p-20 grid md:grid-cols-2 gap-16 border border-slate-200 dark:border-white/5">
            <div>
                <h2 className="text-5xl font-bold mb-6 italic dark:text-blue-400">Have questions?</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    InterAutonomy shares strategies to make your project more self-sustainable. Let&apos;s build together.
                </p>
            </div>

            <form className="space-y-6">
                <input type="text" placeholder="Name" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors" />
                <input type="email" placeholder="Email" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors" />
                <textarea rows={4} placeholder="Message" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors" />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all">
                    Send Message <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    </section>
);