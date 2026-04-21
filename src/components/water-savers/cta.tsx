'use client';

import React, { memo } from 'react';
import { Droplets } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

function CTA() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 wg overflow-hidden" aria-labelledby="cta-heading">
      {/* Content */}
      <div className="anim-blur relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-6">
          <Droplets className="h-8 w-8 text-white" />
        </div>
        <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
          {t('cta_title')}
        </h2>
        <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          {t('cta_desc')}
        </p>
        <a
          href="#langkah"
          className="inline-flex items-center gap-2 rounded-full bg-ocean-700 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-ocean-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Droplets className="h-5 w-5" />
          {t('cta_btn')}
        </a>
      </div>
    </section>
  );
}

export default memo(CTA);