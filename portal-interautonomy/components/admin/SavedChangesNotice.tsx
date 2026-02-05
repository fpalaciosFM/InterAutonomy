'use client';

import { useEffect } from 'react';

import StatusNotice from './StatusNotice';

type Props = {
  message?: string;
};

export default function SavedChangesNotice({ message = 'Cambios guardados correctamente.' }: Props) {
  function clearSavedParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('saved')) return;
    url.searchParams.delete('saved');
    const qs = url.searchParams.toString();
    const nextUrl = `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    clearSavedParam();
  }, []);

  return (
    <StatusNotice
      variant="success"
      dismissible
      dismissLabel="Cerrar notificación"
      onDismiss={clearSavedParam}
    >
      {message}
    </StatusNotice>
  );
}
