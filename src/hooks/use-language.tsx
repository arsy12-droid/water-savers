'use client';

import { createContext, useContext, useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { translations, type Lang } from '@/lib/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LS_KEY = 'ws_lang';

// Custom event emitter for same-tab language changes
const listeners = new Set<() => void>();
function emitChange() {
  for (const l of listeners) l();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): Lang {
  const saved = localStorage.getItem(LS_KEY) as Lang | null;
  return saved === 'id' || saved === 'en' ? saved : 'id';
}

function getServerSnapshot(): Lang {
  return 'id';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync html lang attribute for accessibility & SEO
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(LS_KEY, newLang);
    emitChange();
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.id || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
