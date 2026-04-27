'use client';

import React, { memo } from 'react';
import { Droplets } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

function CTA() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 wg overflow-hidden" aria-labelledby="cta-heading">
      {/* Layered gradient orbs for depth */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl fl-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-400/8 rounded-full blur-3xl fl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl fl2" />
      </div>

      {/* Floating water bubbles */}
      <div className="cta-bubble w-3 h-3 bottom-10 left-[15%]" style={{ animation: 'ctaBubbleFloat 8s ease-in-out infinite' }} aria-hidden="true" />
      <div className="cta-bubble w-2 h-2 bottom-20 left-[30%]" style={{ animation: 'ctaBubbleFloat 7s ease-in-out 1s infinite' }} aria-hidden="true" />
      <div className="cta-bubble w-4 h-4 bottom-5 left-[50%]" style={{ animation: 'ctaBubbleFloat 9s ease-in-out 2s infinite' }} aria-hidden="true" />
      <div className="cta-bubble w-2 h-2 bottom-15 left-[70%]" style={{ animation: 'ctaBubbleFloat 6s ease-in-out 0.5s infinite' }} aria-hidden="true" />
      <div className="cta-bubble w-3 h-3 bottom-25 left-[85%]" style={{ animation: 'ctaBubbleFloat 10s ease-in-out 3s infinite' }} aria-hidden="true" />
      <div className="cta-bubble w-1.5 h-1.5 bottom-8 left-[42%]" style={{ animation: 'ctaBubbleFloat 7.5s ease-in-out 1.5s infinite' }} aria-hidden="true" />

      {/* Wave transition at top */}
      <svg className="cta-wave cta-wave-top" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,10 1440,20 L1440,0 L0,0 Z"
          fill="rgba(255,255,255,0.05)"
        />
      </svg>

      {/* Wave transition at bottom */}
      <svg className="cta-wave cta-wave-bottom" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,10 1440,20 L1440,0 L0,0 Z"
          fill="rgba(255,255,255,0.05)"
        />
      </svg>

      {/* Content */}
      <div className="anim-blur relative z-10 max-w-3xl mx-auto px-4 text-center">
        {/* Icon container with animated ring effect */}
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8 cta-ring backdrop-blur-sm border border-white/15">
          <Droplets className="h-9 w-9 text-white drop-shadow-lg" />
        </div>
        <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          {t('cta_title')}
        </h2>
        <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          {t('cta_desc')}
        </p>

        {/* CTA button with animated gradient glow */}
        <div className="cta-btn-glow inline-block">
          <a
            href="#langkah"
            className="cta-border-animated inline-flex items-center gap-2.5 rounded-full px-9 py-4 text-base font-bold text-white shadow-lg hover:scale-105 active:scale-100 transition-transform duration-300"
          >
            <Droplets className="h-5 w-5" />
            {t('cta_btn')}
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(CTA);
