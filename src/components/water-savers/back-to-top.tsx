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
      className={`fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full text-white flex items-center justify-center btt-enhanced shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform duration-300 ${
        visible ? 'show' : 'hide'
      }`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      }}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5 relative z-10" />
    </button>
  );
}

export default memo(BackToTop);
