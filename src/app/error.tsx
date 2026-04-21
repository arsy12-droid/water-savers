'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { Lang } from '@/lib/translations';

const TEXT = {
  id: { title: 'Oops! Terjadi kesalahan', desc: 'Sesuatu yang tidak terduga terjadi. Silakan coba lagi.', btn: 'Coba Lagi' },
  en: { title: 'Oops! Something went wrong', desc: 'Something unexpected happened. Please try again.', btn: 'Try Again' },
};

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): Lang {
  const saved = localStorage.getItem('ws_lang');
  return saved === 'en' ? 'en' : 'id';
}

function getServerSnapshot(): Lang {
  return 'id';
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = TEXT[lang];

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-4">💧</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {t.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t.desc}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-ocean-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          {t.btn}
        </button>
      </div>
    </div>
  );
}
