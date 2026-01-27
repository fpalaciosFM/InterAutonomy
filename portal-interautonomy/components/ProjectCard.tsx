import Image from 'next/image';

type ProjectCardProject = {
  id?: string;
  slug: string;
  thumbnail_url?: string | null;
  translations?: Record<string, { title?: string; short_description?: string }> | null;
};

export default function ProjectCard({ project, lang = 'en' }: { project: ProjectCardProject; lang?: string }) {
  const title = project.translations?.[lang]?.title || project.translations?.en?.title || project.slug;
  const shortDescription =
    project.translations?.[lang]?.short_description || project.translations?.en?.short_description || '';

  const imgSrc = project.thumbnail_url || '';

  return (
    <article className="group rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-900 transition-transform hover:-translate-y-0.5">
      <div className="relative h-56 bg-slate-200 dark:bg-slate-800">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {shortDescription ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
            {shortDescription}
          </p>
        ) : null}
      </div>
    </article>
  );
}
