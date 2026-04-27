'use client';

import React, { memo } from 'react';
import { BarChart3, MapPin, FlaskConical, DropletOff, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const STATS = [
  {
    value: '~10%',
    descKey: 'd1_desc',
    icon: MapPin,
    bg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
    delay: '',
  },
  {
    value: '73%',
    descKey: 'd2_desc',
    icon: FlaskConical,
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-500',
    delay: 'd1',
  },
  {
    value: '37%',
    descKey: 'd3_desc',
    icon: DropletOff,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600',
    delay: 'd2',
  },
  {
    value: 'Medium-High',
    descKey: 'd4_desc',
    icon: Globe,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    delay: 'd3',
  },
] as const;

const BARS = [
  { labelKey: 'b1_label', pct: 35, gradient: 'from-cyan-400 to-blue-500' },
  { labelKey: 'b2_label', pct: 30, gradient: 'from-blue-400 to-indigo-500' },
  { labelKey: 'b3_label', pct: 20, gradient: 'from-indigo-400 to-purple-500' },
  { labelKey: 'b4_label', pct: 10, gradient: 'from-purple-400 to-pink-500' },
  { labelKey: 'b5_label', pct: 5, gradient: 'from-pink-400 to-rose-500' },
] as const;

const StatCard = memo(function StatCard({ stat, t }: { stat: typeof STATS[number]; t: (key: string) => string }) {
  const Icon = stat.icon;
  return (
    <div className={`anim-scale ${stat.delay} stat-card-enhanced shimmer-sweep bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 ${stat.iconColor} stat-icon-bounce`} />
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-ocean-900 dark:text-white mb-2 num-reveal num-glow">
        {stat.value}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {t(stat.descKey)}
      </p>
    </div>
  );
});

function DataSection() {
  const { t } = useLanguage();

  return (
    <section id="data" aria-labelledby="data-heading" className="relative py-20 sm:py-24 wg overflow-hidden">
      {/* Floating decorative orbs */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 data-orb bg-cyan-300 fl" />
      <div className="absolute bottom-[15%] right-[8%] w-48 h-48 data-orb bg-blue-400 fld" />
      <div className="absolute top-[60%] left-[50%] w-32 h-32 data-orb bg-indigo-300 fl2" />

      {/* Decorative ring pattern */}
      <div className="absolute top-[20%] right-[15%] w-40 h-40 rounded-full border border-white/5 rotate-slow pointer-events-none" />
      <div className="absolute bottom-[25%] left-[12%] w-24 h-24 rounded-full border border-white/[0.07] rotate-slow pointer-events-none" />
      <div className="absolute top-[45%] left-[70%] w-16 h-16 rounded-full bg-white/[0.03] pulse-ring pointer-events-none" />

      {/* Decorative dots */}
      <div className="absolute top-[8%] right-[25%] w-2 h-2 rounded-full bg-cyan-300/20 fl" />
      <div className="absolute bottom-[10%] left-[30%] w-1.5 h-1.5 rounded-full bg-blue-300/20 fld" />
      <div className="absolute top-[50%] left-[8%] w-2.5 h-2.5 rounded-full bg-indigo-300/15 fl2" />
      <div className="absolute bottom-[40%] right-[5%] w-1 h-1 rounded-full bg-white/20 fl-slow" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="anim inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 mb-6 badge-dot">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">{t('data_badge')}</span>
          </div>
          <h2 id="data-heading" className="anim d1 text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('data_title')}{' '}
            <span className="tg">{t('data_title_accent')}</span>
          </h2>
          <p className="anim d2 text-white/70 text-base sm:text-lg leading-relaxed">
            {t('data_desc')}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {STATS.map((stat) => (
            <StatCard key={stat.descKey} stat={stat} t={t} />
          ))}
        </div>

        {/* Bar chart — glass morphism card */}
        <div className="anim-blur data-glass-card bg-white/[0.85] dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg shadow-black/[0.04] dark:shadow-black/20" role="img" aria-label={t('chart_title')}>
          <h3 className="text-lg font-bold text-ocean-900 dark:text-white mb-6">{t('chart_title')}</h3>
          <div className="space-y-5">
            {BARS.map((bar) => (
              <div key={bar.labelKey} className="group bar-row-hover">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(bar.labelKey)}</span>
                  <span className="text-sm font-bold text-ocean-600 dark:text-cyan-400">{bar.pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-ocean-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`bar-fill-enhanced h-full rounded-full bg-gradient-to-r ${bar.gradient}`}
                    data-width={bar.pct}
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6 leading-relaxed">{t('chart_src')}</p>
        </div>
      </div>
    </section>
  );
}

export default memo(DataSection);
