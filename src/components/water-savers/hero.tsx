'use client';

import { useState } from 'react';
import { ChevronDown, Droplet, DropletOff, ArrowRight, AlertTriangle, Droplets } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const PARTICLE_COLORS = [
  'rgba(96,165,250,0.5)',
  'rgba(14,165,233,0.4)',
  'rgba(59,130,246,0.6)',
  'rgba(6,182,212,0.4)',
  'rgba(34,211,238,0.3)',
  'rgba(147,197,253,0.5)',
];

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Reduced particle count for smoother performance
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(seeded(i) * 100).toFixed(2)}%`,
  top: `${(20 + seeded(i + 50) * 60).toFixed(2)}%`,
  size: `${(3 + seeded(i + 100) * 10).toFixed(2)}px`,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: `${(seeded(i + 150) * 6).toFixed(2)}s`,
  duration: `${(6 + seeded(i + 200) * 8).toFixed(2)}s`,
}));

// Reduced bubble count
const BUBBLES = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  left: `${(seeded(i + 300) * 100).toFixed(1)}%`,
  bottom: `${(seeded(i + 400) * 25).toFixed(1)}%`,
  size: `${(10 + seeded(i + 500) * 20).toFixed(0)}px`,
  delay: `${(seeded(i + 600) * 4).toFixed(1)}s`,
  duration: `${(7 + seeded(i + 700) * 5).toFixed(1)}s`,
  opacity: `${(0.03 + seeded(i + 800) * 0.06).toFixed(3)}`,
}));

export default function Hero() {
  const { t } = useLanguage();
  const [showCausePopup, setShowCausePopup] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-mesh">
      {/* Floating particles — reduced for smoother scroll */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle pointer-events-none"
          aria-hidden="true"
          suppressHydrationWarning
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationName: 'particleFloat',
            animationDuration: p.duration,
            animationTimingFunction: 'ease-in-out',
            animationDelay: p.delay,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Floating glass bubbles — reduced */}
      {BUBBLES.map((b) => (
        <div
          key={`bubble-${b.id}`}
          className="pointer-events-none absolute rounded-full"
          aria-hidden="true"
          style={{
            left: b.left,
            bottom: b.bottom,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent)',
            animationName: 'floatSway',
            animationDuration: b.duration,
            animationTimingFunction: 'ease-in-out',
            animationDelay: b.delay,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Floating orbs — layered depth (static, no animation to reduce jitter) */}
      <div className="absolute top-[20%] left-[8%] w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-ocean-400/5 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Ripple circles — subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
        <div className="rp absolute w-40 h-40 -ml-20 -mt-20 rounded-full border border-cyan-300/15" />
        <div className="rpd absolute w-40 h-40 -ml-20 -mt-20 rounded-full border border-cyan-300/15" />
      </div>

      {/* Water drops — subtle */}
      <div className="absolute top-[15%] left-[20%] pointer-events-none" aria-hidden="true">
        <div className="dr w-3 h-4 rounded-full bg-cyan-300/60" style={{ animationName: 'dropFall', animationDuration: '2.2s', animationTimingFunction: 'ease-in', animationIterationCount: 'infinite' }} />
      </div>
      <div className="absolute top-[30%] right-[25%] pointer-events-none" aria-hidden="true">
        <div className="dr1 w-2 h-3 rounded-full bg-blue-300/50" style={{ animationName: 'dropFall', animationDuration: '2.2s', animationTimingFunction: 'ease-in', animationDelay: '0.75s', animationIterationCount: 'infinite' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-36">
        {/* Badge with pulsing dot */}
        <div className="af inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 mb-8">
          <div className="relative">
            <Droplet className="w-4 h-4 text-cyan-300" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="text-blue-100 text-sm font-medium">{t('hero_badge')}</span>
        </div>

        {/* Title with gradient */}
        <h1 className="af d1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          {t('hero_title_before')}
          <br />
          <span className="tg">{t('hero_title_accent')}</span>
        </h1>

        {/* Description */}
        <p className="af d2 text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('hero_desc')}
        </p>

        {/* CTA buttons */}
        <div className="af d3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#langkah"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg shadow-white/10 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('hero_btn1')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
          <button
            onClick={() => setShowCausePopup(true)}
            className="group inline-flex items-center gap-2 px-8 py-4 glass-dark text-white font-medium rounded-full hover:bg-white/20 transition-all duration-500 cursor-pointer active:scale-95"
          >
            <DropletOff className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            {t('hero_btn2')}
          </button>
        </div>

        {/* Causes popup */}
        <Dialog open={showCausePopup} onOpenChange={setShowCausePopup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-orange-500" />
                </div>
              </div>
              <DialogTitle className="text-xl text-center font-bold">
                {t('cause_popup_title')}
              </DialogTitle>
              <DialogDescription className="text-center text-sm leading-relaxed">
                {t('cause_popup_desc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-3 sm:flex-col sm:gap-3 mt-2">
              <a
                href="#penyebab"
                onClick={() => setShowCausePopup(false)}
                className="w-full text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 no-underline"
              >
                {t('cause_popup_confirm')}
              </a>
              <button
                onClick={() => setShowCausePopup(false)}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('cause_popup_cancel')}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wave SVGs — bottom transition */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none" aria-hidden="true">
        <svg
          className="wv absolute bottom-0 w-[200%] h-20 sm:h-24"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L0,120Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
        <svg
          className="wvs absolute bottom-0 w-[200%] h-16 sm:h-20"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,90.7C960,85,1056,75,1152,74.7C1248,75,1344,85,1392,90.7L1440,96L1440,120L0,120Z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>
      </div>

      {/* Scroll indicator — animated down arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs font-medium text-white/50 tracking-wider uppercase">{t('hero_scroll')}</span>
        <div className="sb">
          <ChevronDown className="h-6 w-6 text-white/60" />
        </div>
      </div>
    </section>
  );
}
