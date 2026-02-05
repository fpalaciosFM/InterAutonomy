'use client';

import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = window.setInterval(() => setCooldownSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldownSeconds]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldownSeconds > 0) return;
    setStatus('loading');
    setMessage('');

    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback?next=/admin`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setStatus('error');
      const msg = error.message || 'Login failed.';
      const isRateLimit = /rate limit/i.test(msg);
      setMessage(
        isRateLimit
          ? 'Rate limit exceeded. Please wait a bit before requesting another email (or use a freshly generated link from the Supabase dashboard).'
          : msg
      );
      if (isRateLimit) setCooldownSeconds(60);
      return;
    }

    setStatus('sent');
    setMessage('Check your email for the sign-in link.');
    setCooldownSeconds(60);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium">Admin email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </label>

      <button
        type="submit"
        disabled={status === 'loading' || cooldownSeconds > 0}
        className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
      >
        {status === 'loading'
          ? 'Sending…'
          : cooldownSeconds > 0
            ? `Wait ${cooldownSeconds}s`
            : 'Send magic link'}
      </button>

      {message ? (
        <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm text-slate-600 dark:text-slate-300'}>
          {message}
        </p>
      ) : null}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        You’ll be redirected back to <span className="font-mono">/admin</span> after signing in.
      </p>
    </form>
  );
}
