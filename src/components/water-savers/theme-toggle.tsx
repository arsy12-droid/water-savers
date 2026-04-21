'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed to avoid hydration mismatch with next-themes
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <button
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      data-no-share-close
    >
      <Moon className="w-7 h-7 icon-moon" />
      <Sun className="w-7 h-7 icon-sun" />
    </button>
  );
}