'use client';

import React, { memo } from 'react';
import { Droplet, DropletOff, Droplets, ShowerHead, Hand, FlaskConical, Wrench, Recycle, Trash2, Megaphone, Ban, Footprints, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { LucideIcon } from 'lucide-react';

interface StepItem {
  stepNum: string;
  stepClass: string;
  icon: LucideIcon;
  gradientClasses: string;
  titleKey: string;
  descKey: string;
  statKey: string;
  statColor: string;
}

const STEPS: StepItem[] = [
  { stepNum: '01', stepClass: 's1', icon: DropletOff, gradientClasses: 'from-blue-500 to-cyan-400', titleKey: 's1_title', descKey: 's1_desc', statKey: 's1_stat', statColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { stepNum: '02', stepClass: 's2', icon: Droplet, gradientClasses: 'from-cyan-500 to-teal-400', titleKey: 's2_title', descKey: 's2_desc', statKey: 's2_stat', statColor: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
  { stepNum: '03', stepClass: 's3', icon: ShowerHead, gradientClasses: 'from-teal-500 to-green-400', titleKey: 's3_title', descKey: 's3_desc', statKey: 's3_stat', statColor: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  { stepNum: '04', stepClass: 's4', icon: Hand, gradientClasses: 'from-green-500 to-lime-400', titleKey: 's4_title', descKey: 's4_desc', statKey: 's4_stat', statColor: 'bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400' },
  { stepNum: '05', stepClass: 's5', icon: FlaskConical, gradientClasses: 'from-indigo-500 to-purple-400', titleKey: 's5_title', descKey: 's5_desc', statKey: 's5_stat', statColor: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
  { stepNum: '06', stepClass: 's6', icon: Wrench, gradientClasses: 'from-purple-500 to-fuchsia-400', titleKey: 's6_title', descKey: 's6_desc', statKey: 's6_stat', statColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  { stepNum: '07', stepClass: 's7', icon: Ban, gradientClasses: 'from-amber-500 to-orange-400', titleKey: 's7_title', descKey: 's7_desc', statKey: 's7_stat', statColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  { stepNum: '08', stepClass: 's8', icon: Recycle, gradientClasses: 'from-teal-500 to-cyan-400', titleKey: 's8_title', descKey: 's8_desc', statKey: 's8_stat', statColor: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
  { stepNum: '09', stepClass: 's9', icon: Trash2, gradientClasses: 'from-red-500 to-orange-400', titleKey: 's9_title', descKey: 's9_desc', statKey: 's9_stat', statColor: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  { stepNum: '10', stepClass: 's10', icon: Megaphone, gradientClasses: 'from-pink-500 to-purple-400', titleKey: 's10_title', descKey: 's10_desc', statKey: 's10_stat', statColor: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' },
];

const DELAYS = ['', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'];

const StepCard = memo(function StepCard({ step, delay, t }: { step: StepItem; delay: string; t: (key: string) => string }) {
  return (
    <div
      className={`anim ${delay} step-card-enhanced card-glow ${step.stepClass} bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative`}
    >
      <span className="step-num" aria-hidden="true">{step.stepNum}</span>
      <div className={`step-icon-inner w-11 h-11 rounded-xl bg-gradient-to-br ${step.gradientClasses} flex items-center justify-center mb-3 shadow-lg text-lg`}>
        <step.icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-bold text-ocean-900 dark:text-white text-sm mb-1.5">{t(step.titleKey)}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">{t(step.descKey)}</p>
      <div className={`flex items-center gap-1.5 text-xs font-bold ${step.statColor} px-2.5 py-1 rounded-full w-fit`}>
        <Droplets className="w-3.5 h-3.5" />
        <span>{t(step.statKey)}</span>
      </div>
    </div>
  );
});

function Steps() {
  const { t } = useLanguage();

  return (
    <section id="langkah" aria-labelledby="steps-heading" className="relative py-24 steps-dot-bg overflow-hidden">
      {/* Top gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400" aria-hidden="true" />

      {/* Floating decorative blobs */}
      <div className="steps-blob-1 absolute -top-20 -left-32 w-72 h-72 rounded-full bg-blue-400/[0.07] dark:bg-blue-500/[0.04] blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="steps-blob-2 absolute top-1/3 -right-28 w-80 h-80 rounded-full bg-cyan-400/[0.06] dark:bg-cyan-500/[0.03] blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="steps-blob-3 absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-teal-400/[0.06] dark:bg-teal-500/[0.03] blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 anim-blur">
          <div className="inline-flex items-center gap-2 badge-dot bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full mb-5 shadow-sm ring-1 ring-blue-200/60 dark:ring-blue-700/30">
            <Footprints className="h-4 w-4" />
            <span>{t('steps_badge')}</span>
          </div>
          <h2 id="steps-heading" className="anim d1 text-3xl md:text-5xl font-black text-ocean-900 dark:text-white tracking-tight mb-2">
            {t('steps_title')} <span className="tg">{t('steps_title_accent')}</span>
          </h2>
          <div className="anim mb-6 flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t('steps_campaign_label')}</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg shadow-sm">{t('ft_brand')}</div>
          </div>
          <p className="anim d2 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-4">
            {t('steps_desc')}
          </p>
          <p className="anim d3 text-gray-400 dark:text-gray-500 text-sm max-w-xl mx-auto italic">{t('steps_quote')}</p>
        </div>

        {/* Step cards with connecting dots overlay */}
        <div className="relative mb-14">
          {/* Connecting dots decorative layer behind cards */}
          <div className="steps-connect-dots absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true" />
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <StepCard key={step.stepNum} step={step} delay={DELAYS[i]} t={t} />
            ))}
          </div>
        </div>

        {/* Calculator promo card — enhanced glassmorphism */}
        <div className="anim-scale steps-calc-glass bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-8 md:p-12 text-center text-white relative pulse-glow">
          <div className="shimmer absolute inset-0 rounded-3xl" aria-hidden="true" />
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/[0.04] rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" aria-hidden="true" />
          <div className="relative z-10">
            <h3 className="text-xl md:text-3xl font-black mb-3">{t('calc_title')}</h3>
            <p className="text-blue-100/80 mb-6">{t('calc_desc')}</p>
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 ring-1 ring-white/20">
              <Droplets className="w-8 h-8" />
              <span className="text-4xl md:text-6xl font-black counter-glow">50-70</span>
              <span className="text-lg md:text-xl font-semibold">{t('calc_unit')}</span>
            </div>
            <p className="text-blue-100/60 text-sm mt-5">
              {t('calc_note_id_1')} <strong className="text-white">{t('calc_note_bold')}</strong> {t('calc_note_id_2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Steps);
