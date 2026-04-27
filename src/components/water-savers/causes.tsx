'use client';

import React, { memo } from 'react';
import { Factory, Trees, DropletOff, ThermometerSun, Building2, Wrench, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const CAUSES = [
  { icon: Factory, titleKey: 'c1_title', descKey: 'c1_desc', iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500', borderHover: 'hover:border-l-red-500', delay: '' },
  { icon: Trees, titleKey: 'c2_title', descKey: 'c2_desc', iconBg: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-500', borderHover: 'hover:border-l-orange-500', delay: 'd1' },
  { icon: DropletOff, titleKey: 'c3_title', descKey: 'c3_desc', iconBg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600', borderHover: 'hover:border-l-yellow-500', delay: 'd2' },
  { icon: ThermometerSun, titleKey: 'c4_title', descKey: 'c4_desc', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600', borderHover: 'hover:border-l-amber-500', delay: 'd3' },
  { icon: Building2, titleKey: 'c5_title', descKey: 'c5_desc', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500', borderHover: 'hover:border-l-purple-500', delay: 'd4' },
  { icon: Wrench, titleKey: 'c6_title', descKey: 'c6_desc', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500', borderHover: 'hover:border-l-blue-500', delay: 'd5' },
];

const CauseCard = memo(function CauseCard({ cause, index, t }: { cause: typeof CAUSES[number]; index: number; t: (key: string) => string }) {
  const Icon = cause.icon;
  const numStr = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`anim ${cause.delay} cause-card-enhanced shimmer-sweep card-glow bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        {/* Icon container — larger with shadow */}
        <div className={`step-icon-inner w-14 h-14 shrink-0 rounded-2xl ${cause.iconBg} flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-black/20`}>
          <Icon className={`w-6 h-6 ${cause.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ocean-900 dark:text-white text-base mb-1">{t(cause.titleKey)}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t(cause.descKey)}</p>
        </div>
        {/* Subtle index number */}
        <span className="shrink-0 text-4xl font-black text-gray-100 dark:text-white/[0.04] leading-none select-none tabular-nums">
          {numStr}
        </span>
      </div>
    </div>
  );
});

function Causes() {
  const { t } = useLanguage();

  return (
    <section id="penyebab" aria-labelledby="causes-heading" className="relative py-28 overflow-hidden">
      {/* Decorative gradient accent line at the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-300/40 to-transparent blur-[1px]" />

      {/* Radial gradient background pattern behind cards */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(239,68,68,0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(239,68,68,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 anim-blur">
          <div className="inline-flex items-center gap-2 badge-dot bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full mb-5 shadow-sm shadow-red-100 dark:shadow-red-900/30">
            <AlertTriangle className="h-4 w-4" />
            <span>{t('cause_badge')}</span>
          </div>
          <h2
            id="causes-heading"
            className="anim d1 text-4xl sm:text-5xl md:text-6xl font-black text-ocean-900 dark:text-white tracking-tight mb-5"
          >
            {t('cause_title')}{' '}
            <span className="relative">
              <span className="text-red-500">{t('cause_title_accent')}</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-red-400 to-orange-400 opacity-40" />
            </span>
          </h2>
          <p className="anim d2 text-gray-500 dark:text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('cause_desc')}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAUSES.map((cause, index) => (
            <CauseCard key={cause.titleKey} cause={cause} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Causes);
