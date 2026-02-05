"use client";

import dynamic from 'next/dynamic';

type ProjectRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
  published_at: string | null;
};

type ActionFn = (formData: FormData) => void | Promise<void>;

const AdminProjectsTable = dynamic(() => import('./AdminProjectsTable'), {
  ssr: false,
});

export default function AdminProjectsTableNoSSR(props: {
  projects: ProjectRow[];
  setProjectStatus: ActionFn;
  softDeleteProject: ActionFn;
  restoreProject: ActionFn;
}) {
  return <AdminProjectsTable {...props} />;
}
