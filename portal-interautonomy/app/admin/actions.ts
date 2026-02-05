'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/admin';
import { sanitizeHtmlFragment } from '@/lib/sanitizeHtml';

const LANGS = ['es', 'en', 'zh'] as const;

type TranslationLang = Record<string, unknown>;
type Translations = Record<string, TranslationLang>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTranslations(value: unknown): Translations | null {
  if (!isPlainObject(value)) return null;
  const out: Translations = {};
  for (const [lang, langValue] of Object.entries(value)) {
    if (isPlainObject(langValue)) out[lang] = langValue;
  }
  return out;
}

function cleanSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function readNullableString(formData: FormData, key: string): string | null {
  const v = readString(formData, key);
  return v ? v : null;
}

function parseGalleryUrls(input: string): string[] {
  return input
    .split(/\r?\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeTranslations(existing: Translations | null, patch: Translations): Translations {
  return { ...(existing ?? {}), ...patch };
}

function cleanHtml(input: string): string {
  return sanitizeHtmlFragment(input);
}

export async function createProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = cleanSlug(String(formData.get('slug') || ''));
  if (!slug) throw new Error('Missing slug');

  const { error } = await supabase.from('projects').insert({ slug, status: 'draft', translations: {} });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
}

export async function updateProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = readString(formData, 'id');
  if (!id) throw new Error('Missing id');

  type ExistingProjectRow = { slug: string; translations: unknown };

  const { data: existingRow, error: existingError } = await supabase
    .from('projects')
    .select('slug, translations')
    .eq('id', id)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const typedExistingRow = existingRow as ExistingProjectRow | null;
  const existingSlug = typeof typedExistingRow?.slug === 'string' ? typedExistingRow.slug : null;
  const existingTranslations = asTranslations(typedExistingRow?.translations);

  const translationsPatch: Translations = {};
  for (const lang of LANGS) {
    const title = readString(formData, `${lang}_title`);
    const shortDescription = cleanHtml(readString(formData, `${lang}_short_description`));
    const introduction = cleanHtml(readString(formData, `${lang}_introduction`));
    const videoUrl = readString(formData, `${lang}_video_url`);
    const externalLinkText = readString(formData, `${lang}_external_link_text`);
    const locationMapText = readString(formData, `${lang}_location_map_text`);

    translationsPatch[lang] = {
      ...((existingTranslations?.[lang] ?? {}) as TranslationLang),
      ...(title ? { title } : {}),
      short_description: shortDescription,
      introduction: introduction,
      ...(videoUrl ? { video_url: videoUrl } : {}),
      ...(externalLinkText ? { external_link_text: externalLinkText } : {}),
      ...(locationMapText ? { location_map_text: locationMapText } : {}),
    };
  }

  const translations = mergeTranslations(existingTranslations, translationsPatch);

  const thumbnailUrl = readNullableString(formData, 'thumbnail_url');
  const externalLinkUrl = readNullableString(formData, 'external_link_url');
  const locationMapUrl = readNullableString(formData, 'location_map_url');
  const galleryUrlsRaw = readString(formData, 'gallery_urls');
  const galleryUrls = parseGalleryUrls(galleryUrlsRaw);

  const { error } = await supabase
    .from('projects')
    .update({
      thumbnail_url: thumbnailUrl,
      external_link_url: externalLinkUrl,
      location_map_url: locationMapUrl,
      gallery_urls: galleryUrls,
      translations,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/projects');
  if (existingSlug) revalidatePath(`/admin/projects/${existingSlug}`);
  revalidatePath('/projects');

  redirect(existingSlug ? `/admin/projects/${existingSlug}?saved=1` : '/admin/projects?saved=1');
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

export async function updateStrategy(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = readString(formData, 'id');
  if (!id) throw new Error('Missing id');

  type ExistingStrategyRow = { slug: string; translations: unknown };

  const { data: existingRow, error: existingError } = await supabase
    .from('strategies')
    .select('slug, translations')
    .eq('id', id)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const typedExistingRow = existingRow as ExistingStrategyRow | null;
  const existingSlug = typeof typedExistingRow?.slug === 'string' ? typedExistingRow.slug : null;
  const existingTranslations = asTranslations(typedExistingRow?.translations);

  const translationsPatch: Translations = {};
  for (const lang of LANGS) {
    const title = readString(formData, `${lang}_title`);
    const descriptionHtml = cleanHtml(readString(formData, `${lang}_description_html`));
    translationsPatch[lang] = {
      ...((existingTranslations?.[lang] ?? {}) as TranslationLang),
      ...(title ? { title } : {}),
      description_html: descriptionHtml,
    };
  }

  const translations = mergeTranslations(existingTranslations, translationsPatch);

  const logoUrl = readNullableString(formData, 'logo_url');
  const heroImageUrl = readNullableString(formData, 'hero_image_url');

  const { error } = await supabase
    .from('strategies')
    .update({
      logo_url: logoUrl,
      hero_image_url: heroImageUrl,
      translations,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/strategies');
  if (existingSlug) revalidatePath(`/admin/strategies/${existingSlug}`);
  revalidatePath('/strategies');

  redirect(existingSlug ? `/admin/strategies/${existingSlug}?saved=1` : '/admin/strategies?saved=1');
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
