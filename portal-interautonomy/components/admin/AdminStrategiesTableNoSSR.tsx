"use client";

import dynamic from 'next/dynamic';

type StrategyRow = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  deleted_at: string | null;
  updated_at: string;
};

type ActionFn = (formData: FormData) => void | Promise<void>;

const AdminStrategiesTable = dynamic(() => import('./AdminStrategiesTable'), {
  ssr: false,
});

export default function AdminStrategiesTableNoSSR(props: {
  strategies: StrategyRow[];
  setStrategyStatus: ActionFn;
  softDeleteStrategy: ActionFn;
  restoreStrategy: ActionFn;
}) {
  return <AdminStrategiesTable {...props} />;
}
