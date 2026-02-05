"use client";

import ProjectCard from '@/components/ProjectCard';

type ProjectRow = {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
  updated_at?: string;
  translations: Record<string, { title?: string; short_description?: string }> | null;
};

export default function ProjectsGrid({
  projects,
  lang,
}: {
  projects: ProjectRow[];
  lang: 'es' | 'en' | 'zh';
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id || p.slug} project={p} lang={lang} />
      ))}
    </section>
  );
}
