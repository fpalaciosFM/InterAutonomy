# INTERautonomy Portal

Modern web portal for INTERautonomy - A platform helping social entrepreneurs discover and apply self-sustainability strategies based on real-world success stories.

## 🚀 Tech Stack

- **Framework:** Next.js 16.1 with Turbopack
- **React:** 19.2.3 (Server Components)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Language:** TypeScript
- **Fonts:** Geist Sans & Geist Mono (Google Fonts)

## 📦 Project Structure

```
portal-interautonomy/
├── app/
│   ├── globals.css         # Global styles with Tailwind v4
│   ├── layout.tsx          # Root layout with fonts & metadata
│   └── page.tsx            # Home page composition
├── components/
│   ├── Navbar.tsx          # Navigation bar with i18n selector
│   ├── Hero.tsx            # Hero section with CTA
│   └── ContactForm.tsx     # Contact form component
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS with Tailwind v4
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Components

### `<Navbar />`
Fixed navigation bar featuring:
- **Official branding**: InterAutonomy logo from official website
- **Theme toggle**: Dark/light mode switcher with localStorage persistence
- **Language selector**: Multi-language support (EN/ES/ZH) with dropdown
- **Responsive menu**: Hamburger menu for mobile devices
- **Search functionality**: Ready for implementation
- **Dynamic navigation**: 7 main sections ready for future pages
- **Accessibility**: ARIA labels and semantic HTML

**Technical details:**
- Uses `useLayoutEffect` to prevent flash of unstyled content
- Theme preference persists across sessions
- Detects system color scheme preference on first visit

### `<Hero />`
Main hero section with:
- **Optimized image**: Using next/image with Unsplash background
- **Gradient overlay**: Theme-aware gradient for better readability
- **Interactive CTA**: Call-to-action button with hover animations
- **Responsive typography**: Scales from mobile to desktop
- **85vh height**: Ensures prominent above-the-fold presence

### `<ContactForm />`
Contact form with:
- **Validated fields**: Name, email, and message inputs
- **Responsive layout**: Two-column design on desktop, stacked on mobile
- **Theme integration**: Full dark mode support
- **Accessible elements**: Semantic form structure
- **Visual feedback**: Focus states and hover effects

**TODO:**
- Connect to backend API or email service
- Add client-side validation
- Implement success/error toast notifications

## 🛠️ Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

4. **Lint code:**
   ```bash
   npm run lint
   ```

## 🎯 Development Guidelines

### Code Style
- Use **TypeScript** for type safety
- Follow **React 19** best practices (Server Components when possible)
- Keep components **small and focused**
- Use **semantic HTML**
- Ensure **accessibility** (WCAG AA)

### Styling
- Use **Tailwind utility classes** directly in components
- Custom styles in `globals.css` only when necessary
- Maintain **dark mode compatibility** for all components
- Follow **mobile-first** approach

### Component Structure
```tsx
// 1. Imports
import { Icon } from 'lucide-react';
import Image from 'next/image';

// 2. Type definitions (if needed)
interface Props {
  title: string;
}

// 3. Component
export const Component = ({ title }: Props) => (
  <section className="...">
    {/* Content */}
  </section>
);
```

## 🌍 Internationalization (Coming Soon)

The portal is being prepared for multi-language support:
- Spanish (ES) - Primary
- English (EN)
- Chinese (ZH)

Translation data will be fetched from Supabase JSONB columns.

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Tip: you can copy the provided `.env.example` into `.env.local` and fill in your values:

```bash
cp .env.example .env.local
# then edit .env.local
```

### Tailwind Configuration
Using Tailwind CSS v4 with PostCSS plugin:
- Custom components in `globals.css`
- Theme extends system preferences (dark/light)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

## 📈 Performance

- ⚡ **Turbopack** for faster builds
- 🖼️ **Image optimization** with next/image
- 🎨 **CSS optimization** with Tailwind v4
- 📦 **Code splitting** via Next.js App Router
- 🚀 **Server Components** for reduced client bundle

## 🐛 Known Issues

None! All previous issues have been resolved:
- ✅ Tailwind v4 dark mode configuration working correctly
- ✅ Theme toggle functional with proper state management
- ✅ No hydration warnings
- ✅ ESLint passing with no errors


## 📝 TODO

- [ ] Implement i18n routing with Next.js middleware
- [ ] Connect to Supabase for dynamic content
- [ ] Add projects showcase section with filtering
- [ ] Create strategies browsing interface
- [ ] Implement project and strategy catalog pages, displaying lists of all available projects and strategies.
- [ ] Create detail pages for each project and strategy, dynamically fetching their information and translations from Supabase.
- [ ] Ensure all multilingual content (titles, descriptions, etc.) is loaded from Supabase JSONB columns for both catalog and detail pages.
- [ ] Implement search functionality
- [ ] Add authentication (Supabase Auth)
- [ ] Connect contact form to email service
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Optimize images and add proper alt texts
- [ ] Implement SEO metadata per page

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code quality
4. Submit a pull request

## 📄 License

Private project - All rights reserved

## 👤 Author

**Fernando Palacios Ahumada**  
IT Consultant

## Recent Changes

- **chore:** Fixed client/server issues and lint/type problems affecting the `Strategies` page and `Navbar`.
   - Ensured the client directive (`"use client"`) is the first line in `components/Navbar.tsx`.
   - Deferred language `setState` in `Navbar` to avoid synchronous setState-in-effect warnings.
   - Replaced several `any` usages with stricter types in `app/strategies/page.tsx` and `components/StrategyCard.tsx`.
   - Resolved a locked native swc binary and reinstalled dependencies (`npm ci`), which fixed a Next.js/Turbopack dev panic.

## Quick Local Development Checklist

- Install dependencies:

```bash
npm ci
```

- Create a `.env.local` with Supabase variables (if using dynamic content):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- Remove build cache if you encounter dev panics or native binary errors:

```powershell
rm -Recurse -Force .next
```

- Run development server:

```bash
npm run dev
```

If you see a panic referencing `next-swc.win32-x64-msvc.node` on Windows, stop all Node processes, remove the locked file under `node_modules/@next/`, then run `npm ci` again.
