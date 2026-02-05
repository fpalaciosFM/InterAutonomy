import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin';

const BUCKET = 'portal-assets';
const MAX_BYTES = 10 * 1024 * 1024;

function safeExtFromName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  const ext = filename.slice(lastDot).toLowerCase();
  if (!/^\.[a-z0-9]{1,10}$/.test(ext)) return '';
  return ext;
}

function safePrefix(prefix: string): string {
  const trimmed = prefix.trim().replace(/^\/+|\/+$/g, '');
  if (!trimmed) return 'uploads';
  if (!/^[a-z0-9/_-]+$/i.test(trimmed)) return 'uploads';
  return trimmed;
}

export async function POST(request: Request) {
  const { supabase } = await requireAdmin();

  const formData = await request.formData();
  const file = formData.get('file');
  const prefixRaw = String(formData.get('prefix') ?? 'uploads');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
  }

  const prefix = safePrefix(prefixRaw);
  const ext = safeExtFromName(file.name);
  const path = `${prefix}/${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ publicUrl: publicData.publicUrl });
}
