'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import type { Lang } from '@/lib/translations';

const TEXT = {
  id: { desc: 'Halaman yang kamu cari tidak ditemukan.', btn: 'Kembali ke Beranda' },
  en: { desc: 'The page you are looking for was not found.', btn: 'Back to Home' },
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

export default function NotFound() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = TEXT[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="text-7xl mb-4">💧</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          404
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {t.desc}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-ocean-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
        >
          {t.btn}
        </Link>
      </div>
    </div>
  );
}
