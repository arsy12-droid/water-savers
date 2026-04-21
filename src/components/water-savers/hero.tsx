'use client';

import { useState } from 'react';
import { ChevronDown, Droplet, DropletOff, ArrowRight, AlertTriangle } from 'lucide-react';
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

// Deterministic pseudo-random from index (no Math.random — avoids hydration mismatch)
function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Reduced from 20 to 12 particles for better performance while keeping visual richness
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(seeded(i) * 100).toFixed(2)}%`,
  top: `${(30 + seeded(i + 50) * 50).toFixed(2)}%`,
  size: `${(4 + seeded(i + 100) * 10).toFixed(2)}px`,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: `${(seeded(i + 150) * 5).toFixed(2)}s`,
  duration: `${(5 + seeded(i + 200) * 7).toFixed(2)}s`,
}));

export default function Hero() {
  const { t } = useLanguage();
  const [showCausePopup, setShowCausePopup] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden wg">
      {/* Floating particles */}
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

      {/* Floating orbs */}
      <div className="fl absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="fld absolute bottom-1/4 right-[10%] w-48 h-48 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="fl2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-ocean-400/5 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Ripple circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
        <div className="rp absolute w-32 h-32 -ml-16 -mt-16 rounded-full border border-cyan-300/20" />
        <div className="rpd absolute w-32 h-32 -ml-16 -mt-16 rounded-full border border-cyan-300/20" />
        <div className="rp2 absolute w-32 h-32 -ml-16 -mt-16 rounded-full border border-cyan-300/20" />
      </div>

      {/* Water drops */}
      <div className="absolute top-[15%] left-[20%] pointer-events-none" aria-hidden="true">
        <div className="dr w-3 h-4 rounded-full bg-cyan-300/60" />
      </div>
      <div className="absolute top-[25%] right-[25%] pointer-events-none" aria-hidden="true">
        <div className="dr1 w-2 h-3 rounded-full bg-blue-300/50" />
      </div>
      <div className="absolute top-[35%] left-[60%] pointer-events-none" aria-hidden="true">
        <div className="dr2 w-2.5 h-3.5 rounded-full bg-sky-300/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-32 pb-40">
        <div className="af inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8">
          <Droplet className="w-4 h-4 text-cyan-300" />
          <span className="text-blue-100 text-sm font-medium">{t('hero_badge')}</span>
        </div>

        <h1 className="af d1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          {t('hero_title_before')}
          <br />
          <span className="tg">{t('hero_title_accent')}</span>
        </h1>

        <p className="af d2 text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('hero_desc')}
        </p>

        <div className="af d3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#langkah"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
          >
            {t('hero_btn1')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
          <button
            onClick={() => setShowCausePopup(true)}
            className="inline-flex items-center gap-2 px-8 py-4 glass-dark text-white font-medium rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer"
          >
            <DropletOff className="w-4 h-4" />
            {t('hero_btn2')}
          </button>
        </div>

        {/* Causes popup */}
        <Dialog open={showCausePopup} onOpenChange={setShowCausePopup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
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

      {/* Wave SVGs */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none" aria-hidden="true">
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

      {/* Scroll indicator */}
      <div className="sb absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs font-medium text-white/50">{t('hero_scroll')}</span>
        <ChevronDown className="h-5 w-5 text-white/50" />
      </div>
    </section>
  );
}