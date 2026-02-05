'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/admin';

function cleanSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = cleanSlug(String(formData.get('slug') || ''));
  if (!slug) throw new Error('Missing slug');

  const { error } = await supabase.from('projects').insert({ slug, status: 'draft', translations: {} });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
}

export async function setProjectStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!id) throw new Error('Missing id');
  if (status !== 'draft' && status !== 'published') throw new Error('Invalid status');

  const patch: Record<string, unknown> = { status };
  if (status === 'published') patch.published_at = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from('projects').update(patch).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}

export async function softDeleteProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing id');

  const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}

export async function restoreProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing id');

  const { error } = await supabase.from('projects').update({ deleted_at: null }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}

export async function createStrategy(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = cleanSlug(String(formData.get('slug') || ''));
  if (!slug) throw new Error('Missing slug');

  const { error } = await supabase.from('strategies').insert({ slug, status: 'draft', translations: {} });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/strategies');
}

export async function setStrategyStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!id) throw new Error('Missing id');
  if (status !== 'draft' && status !== 'published') throw new Error('Invalid status');

  const { error } = await supabase.from('strategies').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/strategies');
  revalidatePath('/strategies');
}

export async function softDeleteStrategy(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing id');

  const { error } = await supabase.from('strategies').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/strategies');
  revalidatePath('/strategies');
}

export async function restoreStrategy(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing id');

  const { error } = await supabase.from('strategies').update({ deleted_at: null }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/strategies');
  revalidatePath('/strategies');
}
