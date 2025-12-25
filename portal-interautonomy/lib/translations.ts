/**
 * Translations system for INTERautonomy
 * 
 * Currently uses local state for development.
 * In production, this will be replaced with Supabase JSONB queries
 * to fetch dynamic translations from the database.
 * 
 * @module translations
 */

/**
 * Supported language codes
 */
export type Language = 'en' | 'es' | 'zh';

/**
 * Available languages configuration
 */
export const LANGUAGES = [
  { code: 'en' as Language, name: 'EN', fullName: 'English' },
  { code: 'es' as Language, name: 'ES', fullName: 'Español' },
  { code: 'zh' as Language, name: 'ZH', fullName: '中文' },
] as const;

/**
 * Translation strings for all supported languages
 * Organized by section (nav, hero, contactForm)
 */
export const translations = {
  en: {
    nav: {
      home: 'Home',
      whatIs: 'What is self-sustainability',
      keyIdeas: 'Key Ideas',
      strategies: 'Strategies for self-sustainability',
      projects: 'Projects for change!',
      about: 'About us',
      contact: 'Contact us',
    },
    hero: {
      title: 'Strengthen your own initiative',
      subtitle: 'by learning',
      tagline: 'from the experience!',
      cta: 'Explore Strategies',
    },
    contactForm: {
      title: 'Have questions?',
      description: 'InterAutonomy shares strategies to make your project more self-sustainable. Let\'s build together.',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      messagePlaceholder: 'Message',
      submitButton: 'Send Message',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      whatIs: 'Qué es la autosustentabilidad',
      keyIdeas: 'Ideas Clave',
      strategies: 'Estrategias para la autosustentabilidad',
      projects: '¡Proyectos para el cambio!',
      about: 'Sobre nosotros',
      contact: 'Contáctanos',
    },
    hero: {
      title: 'Fortalece tu propia iniciativa',
      subtitle: 'aprendiendo',
      tagline: '¡de la experiencia!',
      cta: 'Explorar Estrategias',
    },
    contactForm: {
      title: '¿Tienes preguntas?',
      description: 'InterAutonomy comparte estrategias para hacer tu proyecto más autosustentable. Construyamos juntos.',
      namePlaceholder: 'Nombre',
      emailPlaceholder: 'Correo electrónico',
      messagePlaceholder: 'Mensaje',
      submitButton: 'Enviar Mensaje',
    },
  },
  zh: {
    nav: {
      home: '首页',
      whatIs: '什么是自我可持续性',
      keyIdeas: '关键思想',
      strategies: '自我可持续性战略',
      projects: '变革项目！',
      about: '关于我们',
      contact: '联系我们',
    },
    hero: {
      title: '加强你自己的倡议',
      subtitle: '通过学习',
      tagline: '从经验中！',
      cta: '探索策略',
    },
    contactForm: {
      title: '有疑问吗？',
      description: 'InterAutonomy 分享策略，使您的项目更具自我可持续性。让我们一起建设。',
      namePlaceholder: '姓名',
      emailPlaceholder: '电子邮件',
      messagePlaceholder: '消息',
      submitButton: '发送消息',
    },
  },
} as const;

/**
 * Navigation routes configuration
 * Maps route paths to translation keys
 * 
 * @todo Create these pages as they are implemented
 */
export const NAV_ROUTES = [
  { href: '/', key: 'home' },
  { href: '/what-is-self-sustainability', key: 'whatIs' },
  { href: '/key-ideas', key: 'keyIdeas' },
  { href: '/strategies', key: 'strategies' },
  { href: '/projects', key: 'projects' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;
