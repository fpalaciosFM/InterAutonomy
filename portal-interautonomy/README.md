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
- Animated logo
- Search functionality
- Language selector (EN/ES/ZH)
- Responsive mobile menu
- Dark/light mode support

### `<Hero />`
Main hero section with:
- Optimized background image (next/image)
- Gradient overlay (theme-aware)
- Interactive call-to-action button
- Responsive typography

### `<ContactForm />`
Contact form with:
- Name, email, and message fields
- Consistent styling with design system
- Dark mode integration
- Accessible form elements

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

- Hydration warnings from browser extensions (autofill): Normal in development, doesn't affect production
- Unsplash image requires `unoptimized` prop: Replace with local assets in production

## 📝 TODO

- [ ] Implement i18n routing
- [ ] Connect to Supabase for dynamic content
- [ ] Add projects showcase section
- [ ] Create strategies filtering system
- [ ] Implement authentication (Supabase Auth)
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)

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
