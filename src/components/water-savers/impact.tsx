'use client';

import React, { memo } from 'react';
import { DropletOff, CheckCircle2, Stethoscope, Wheat, MountainSnow, HeartPulse, Sprout, Earth } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const NEGATIVE = [
  { icon: Stethoscope, titleKey: 'n1_title', descKey: 'n1_desc' },
  { icon: Wheat, titleKey: 'n2_title', descKey: 'n2_desc' },
  { icon: MountainSnow, titleKey: 'n3_title', descKey: 'n3_desc' },
];

const POSITIVE = [
  { icon: HeartPulse, titleKey: 'p1_title', descKey: 'p1_desc' },
  { icon: Sprout, titleKey: 'p2_title', descKey: 'p2_desc' },
  { icon: Earth, titleKey: 'p3_title', descKey: 'p3_desc' },
];

const PROJECTIONS = [
  { year: '2025', labelKey: 'proj1_label', descKey: 'proj1_desc', color: 'text-blue-300', dotColor: 'bg-blue-400' },
  { year: '2030', labelKey: 'proj2_label', descKey: 'proj2_desc', color: 'text-yellow-300', dotColor: 'bg-yellow-400' },
  { year: '2040', labelKey: 'proj3_label', descKey: 'proj3_desc', color: 'text-orange-300', dotColor: 'bg-orange-400' },
  { year: '2050', labelKey: 'proj4_label', descKey: 'proj4_desc', color: 'text-red-300', dotColor: 'bg-red-400' },
];

function Impact() {
  const { t } = useLanguage();

  return (
    <section id="dampak" aria-labelledby="impact-heading" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle background mesh gradient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50/50 dark:bg-blue-900/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-50/40 dark:bg-cyan-900/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 anim-blur">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 badge-dot">
            <DropletOff className="h-4 w-4" />
            <span>{t('impact_badge')}</span>
          </div>
          <h2 id="impact-heading" className="anim d1 text-3xl md:text-5xl font-black text-ocean-900 dark:text-white tracking-tight mb-4">
            {t('impact_title')} <span className="text-red-500">{t('impact_title_accent')}</span>
          </h2>
          <p className="anim d2 text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">{t('impact_desc')}</p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Negative */}
          <div className="anim-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-md shadow-red-500/10 impact-icon-anim">
                <DropletOff className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-ocean-900 dark:text-white">{t('neg_title')}</h3>
            </div>
            <div className="space-y-3">
              {NEGATIVE.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.titleKey} className="impact-card-enhanced shimmer-sweep bg-red-50/60 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ocean-900 dark:text-white text-sm mb-1">{t(item.titleKey)}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Positive */}
          <div className="anim-right">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-md shadow-green-500/10 impact-icon-anim" style={{ animationDelay: '1.5s' }}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-ocean-900 dark:text-white">{t('pos_title')}</h3>
            </div>
            <div className="space-y-3">
              {POSITIVE.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.titleKey} className="impact-card-enhanced shimmer-sweep bg-green-50/60 dark:bg-green-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ocean-900 dark:text-white text-sm mb-1">{t(item.titleKey)}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projection card */}
        <div className="anim-blur bg-gradient-to-br from-ocean-950 to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full translate-y-1/2 -translate-x-1/4" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-400/5 rounded-full fl-slow" aria-hidden="true" />
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-cyan-400/8 rounded-full fl2" aria-hidden="true" />
          <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-indigo-400/6 rounded-full fld" aria-hidden="true" />

          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">{t('proj_title')}</h3>
            <p className="text-blue-200/50 text-sm text-center mb-10">{t('proj_src')}</p>

            {/* Timeline layout for desktop, grid for mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 proj-timeline">
              {PROJECTIONS.map((proj, i) => (
                <div key={proj.year} className="proj-card rounded-2xl p-4 md:p-5 text-center">
                  <div className={`proj-dot ${proj.dotColor}`} style={{ animationDelay: `${i * 0.5}s` }} />
                  <div className={`text-3xl md:text-4xl font-black ${proj.color} mb-2 shimmer-sweep`}>{proj.year}</div>
                  <div className="text-sm font-semibold text-white mb-1">{t(proj.labelKey)}</div>
                  <p className="text-blue-200/50 text-xs sm:text-sm leading-relaxed">{t(proj.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Impact);
