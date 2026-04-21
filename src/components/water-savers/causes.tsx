'use client';

import React, { memo } from 'react';
import { Factory, Trees, DropletOff, ThermometerSun, Building2, Wrench, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const CAUSES = [
  { icon: Factory, titleKey: 'c1_title', descKey: 'c1_desc', iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500', delay: '' },
  { icon: Trees, titleKey: 'c2_title', descKey: 'c2_desc', iconBg: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-500', delay: 'd1' },
  { icon: DropletOff, titleKey: 'c3_title', descKey: 'c3_desc', iconBg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600', delay: 'd2' },
  { icon: ThermometerSun, titleKey: 'c4_title', descKey: 'c4_desc', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600', delay: 'd3' },
  { icon: Building2, titleKey: 'c5_title', descKey: 'c5_desc', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500', delay: 'd4' },
  { icon: Wrench, titleKey: 'c6_title', descKey: 'c6_desc', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500', delay: 'd5' },
];

const CauseCard = memo(function CauseCard({ cause, t }: { cause: typeof CAUSES[number]; t: (key: string) => string }) {
  const Icon = cause.icon;
  return (
    <div
      className={`anim ${cause.delay} cause-card bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`step-icon-inner w-11 h-11 shrink-0 rounded-xl ${cause.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${cause.iconColor}`} />
        </div>
        <div>
          <h3 className="font-bold text-ocean-900 dark:text-white text-sm mb-1">{t(cause.titleKey)}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t(cause.descKey)}</p>
        </div>
      </div>
    </div>
  );
});

function Causes() {
  const { t } = useLanguage();

  return (
    <section id="penyebab" aria-labelledby="causes-heading" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 anim-blur">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span>{t('cause_badge')}</span>
          </div>
          <h2 id="causes-heading" className="anim d1 text-3xl md:text-5xl font-black text-ocean-900 dark:text-white tracking-tight mb-4">
            {t('cause_title')} <span className="text-red-500">{t('cause_title_accent')}</span>
          </h2>
          <p className="anim d2 text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">{t('cause_desc')}</p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAUSES.map((cause) => (
            <CauseCard key={cause.titleKey} cause={cause} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Causes);