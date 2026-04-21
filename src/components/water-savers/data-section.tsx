'use client';

import React, { memo } from 'react';
import { BarChart3, MapPin, FlaskConical, DropletOff, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const STATS = [
  {
    value: '~18%',
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
    <div className={`anim-scale ${stat.delay} stat-card bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm`}>
      <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-ocean-900 dark:text-white mb-2 num-reveal">
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
    <section id="data" aria-labelledby="data-heading" className="py-20 sm:py-24 wg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="anim inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 mb-6">
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

        {/* Bar chart */}
        <div className="anim-blur bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm" role="img" aria-label={t('chart_title')}>
          <h3 className="text-lg font-bold text-ocean-900 dark:text-white mb-6">{t('chart_title')}</h3>
          <div className="space-y-5">
            {BARS.map((bar) => (
              <div key={bar.labelKey} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(bar.labelKey)}</span>
                  <span className="text-sm font-bold text-ocean-600 dark:text-cyan-400">{bar.pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-ocean-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`bar-fill h-full rounded-full bg-gradient-to-r ${bar.gradient}`}
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