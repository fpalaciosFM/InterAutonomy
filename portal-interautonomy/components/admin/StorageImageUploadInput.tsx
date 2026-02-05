'use client';

import { useId, useRef, useState } from 'react';

type Props = {
  label: string;
  name: string;
  defaultValue?: string;
  prefix: string;
  placeholder?: string;
};

type UploadState = {
  pending: boolean;
  error: string | null;
};

export default function StorageImageUploadInput({ label, name, defaultValue, prefix, placeholder }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? '');
  const [state, setState] = useState<UploadState>({ pending: false, error: null });
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  async function onUploadClick() {
    const file = fileRef.current?.files?.[0] ?? null;
    if (!file) {
      setState({ pending: false, error: 'Select an image first.' });
      return;
    }

    setState({ pending: true, error: null });
    try {
      const body = new FormData();
      body.set('file', file);
      body.set('prefix', prefix);

      const res = await fetch('/admin/upload', { method: 'POST', body });
      const json = (await res.json()) as { publicUrl?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      if (!json.publicUrl) throw new Error('Upload failed (missing URL)');

      setUrl(json.publicUrl);
      if (fileRef.current) fileRef.current.value = '';
      setSelectedFileName('');
      setState({ pending: false, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      setState({ pending: false, error: message });
    }
  }

  return (
    <div className="block">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        placeholder={placeholder ?? 'https://...'}
        autoComplete="off"
      />

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={`${label} file`}
          onChange={() => {
            const file = fileRef.current?.files?.[0] ?? null;
            setSelectedFileName(file?.name ?? '');
            if (state.error) setState((s) => ({ ...s, error: null }));
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={state.pending}
          className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
        >
          Select image
        </button>

        <span className="text-xs text-slate-600 dark:text-slate-300 truncate" title={selectedFileName || undefined}>
          {selectedFileName || 'No file selected'}
        </span>

        <button
          type="button"
          onClick={onUploadClick}
          disabled={state.pending || !selectedFileName}
          className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
        >
          {state.pending ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {state.error ? <p className="mt-2 text-xs text-red-600">{state.error}</p> : null}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Uploads to Supabase Storage bucket “portal-assets”.</p>
    </div>
  );
}
