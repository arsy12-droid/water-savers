'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      id="btt"
      onClick={scrollToTop}
      className={`fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-blue-600 dark:bg-cyan-600 text-white shadow-lg shadow-blue-600/30 dark:shadow-cyan-600/30 hover:bg-blue-700 dark:hover:bg-cyan-700 hover:scale-110 transition-all duration-300 flex items-center justify-center ${
        visible ? 'show' : 'hide'
      }`}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

export default memo(BackToTop);
