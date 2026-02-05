"use client";

import dynamic from 'next/dynamic';

type ProjectRow = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
  updated_at?: string;
  translations: Record<string, { title?: string; short_description?: string }> | null;
};

const ProjectsGrid = dynamic(() => import('./ProjectsGrid'), {
  ssr: false,
});

export default function ProjectsGridNoSSR(props: {
  projects: ProjectRow[];
  lang: 'es' | 'en' | 'zh';
}) {
  return <ProjectsGrid {...props} />;
}
