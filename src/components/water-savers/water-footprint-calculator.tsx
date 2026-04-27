'use client';

import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import {
  Droplets, ShowerHead, Hand, DropletOff, FlaskConical, Recycle, Car,
  Flower2, Gamepad2, ChevronLeft, ChevronRight, RotateCcw, Share2,
  Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Calculator, Bath, UtensilsCrossed, TreePine, Sparkles, Waves, Zap,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { LucideIcon } from 'lucide-react';

/* ===== TYPES ===== */

interface SliderConfig {
  key: string;
  labelKey: string;
  unitKey: string;
  infoKey: string;
  icon: LucideIcon;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  ratePerUnit: number;
  isWeekly: boolean;
  isToggle?: boolean;
  gradient: string;
  glowColor: string;
}

type CategoryKey = 'saving' | 'normal' | 'wasteful' | 'very_wasteful';

interface CategoryInfo {
  key: CategoryKey;
  labelKey: string;
  descKey: string;
  gradient: string;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
  trendIcon: LucideIcon;
  emoji: string;
  barColor: string;
}

/* ===== CONSTANTS ===== */

const WHO_MINIMUM = 50;
const ID_AVG = 150;

const STEP_TITLES = [
  'calc_step1_title', 'calc_step2_title', 'calc_step3_title', 'calc_step4_title',
] as const;

const STEP_ICONS: LucideIcon[] = [ShowerHead, UtensilsCrossed, TreePine, Droplets];

const STEP_GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-purple-400',
];

const CATEGORIES: CategoryInfo[] = [
  {
    key: 'saving', labelKey: 'calc_cat_saving', descKey: 'calc_cat_saving_desc',
    gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/50',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
    trendIcon: TrendingDown, emoji: '🌿', barColor: '#10b981',
  },
  {
    key: 'normal', labelKey: 'calc_cat_normal', descKey: 'calc_cat_normal_desc',
    gradient: 'from-blue-400 via-blue-500 to-cyan-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800/50',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    trendIcon: CheckCircle2, emoji: '✅', barColor: '#3b82f6',
  },
  {
    key: 'wasteful', labelKey: 'calc_cat_wasteful', descKey: 'calc_cat_wasteful_desc',
    gradient: 'from-amber-400 via-orange-500 to-red-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-200 dark:border-orange-800/50',
    iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
    iconColorClass: 'text-orange-600 dark:text-orange-400',
    trendIcon: AlertTriangle, emoji: '⚠️', barColor: '#f59e0b',
  },
  {
    key: 'very_wasteful', labelKey: 'calc_cat_very_wasteful', descKey: 'calc_cat_very_wasteful_desc',
    gradient: 'from-red-400 via-rose-500 to-pink-600',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800/50',
    iconBgClass: 'bg-red-100 dark:bg-red-900/30',
    iconColorClass: 'text-red-600 dark:text-red-400',
    trendIcon: AlertTriangle, emoji: '🚨', barColor: '#ef4444',
  },
];

const STEP1_SLIDERS: SliderConfig[] = [
  { key: 'shower', labelKey: 'calc_q1_label', unitKey: 'calc_q1_unit', infoKey: 'calc_q1_info', icon: ShowerHead, min: 1, max: 30, defaultValue: 10, step: 1, ratePerUnit: 10.5, isWeekly: false, gradient: 'from-blue-500 to-cyan-400', glowColor: 'rgba(59,130,246,0.3)' },
  { key: 'brushing', labelKey: 'calc_q2_label', unitKey: 'calc_q2_unit', infoKey: 'calc_q2_info', icon: DropletOff, min: 0, max: 1, defaultValue: 1, step: 1, ratePerUnit: 12, isWeekly: false, isToggle: true, gradient: 'from-cyan-500 to-teal-400', glowColor: 'rgba(6,182,212,0.3)' },
  { key: 'handwashing', labelKey: 'calc_q3_label', unitKey: 'calc_q3_unit', infoKey: 'calc_q3_info', icon: Hand, min: 1, max: 20, defaultValue: 5, step: 1, ratePerUnit: 1, isWeekly: false, gradient: 'from-teal-500 to-green-400', glowColor: 'rgba(20,184,166,0.3)' },
  { key: 'toilet', labelKey: 'calc_q4_label', unitKey: 'calc_q4_unit', infoKey: 'calc_q4_info', icon: Droplets, min: 1, max: 20, defaultValue: 6, step: 1, ratePerUnit: 6, isWeekly: false, gradient: 'from-sky-500 to-blue-400', glowColor: 'rgba(14,165,233,0.3)' },
];

const STEP2_SLIDERS: SliderConfig[] = [
  { key: 'bottles', labelKey: 'calc_q5_label', unitKey: 'calc_q5_unit', infoKey: 'calc_q5_info', icon: Recycle, min: 0, max: 1, defaultValue: 1, step: 1, ratePerUnit: 2, isWeekly: false, isToggle: true, gradient: 'from-violet-500 to-purple-400', glowColor: 'rgba(139,92,246,0.3)' },
  { key: 'cooking', labelKey: 'calc_q6_label', unitKey: 'calc_q6_unit', infoKey: 'calc_q6_info', icon: FlaskConical, min: 0, max: 5, defaultValue: 2, step: 1, ratePerUnit: 10, isWeekly: false, gradient: 'from-amber-500 to-yellow-400', glowColor: 'rgba(245,158,11,0.3)' },
  { key: 'dishWash', labelKey: 'calc_q7_label', unitKey: 'calc_q7_unit', infoKey: 'calc_q7_info', icon: Sparkles, min: 0, max: 5, defaultValue: 2, step: 1, ratePerUnit: 10, isWeekly: false, gradient: 'from-lime-500 to-green-400', glowColor: 'rgba(132,204,22,0.3)' },
];

const STEP3_SLIDERS: SliderConfig[] = [
  { key: 'plants', labelKey: 'calc_q8_label', unitKey: 'calc_q8_unit', infoKey: 'calc_q8_info', icon: Flower2, min: 0, max: 10, defaultValue: 2, step: 1, ratePerUnit: 10, isWeekly: true, gradient: 'from-green-500 to-emerald-400', glowColor: 'rgba(34,197,94,0.3)' },
  { key: 'vehicle', labelKey: 'calc_q9_label', unitKey: 'calc_q9_unit', infoKey: 'calc_q9_info', icon: Car, min: 0, max: 1, defaultValue: 0, step: 1, ratePerUnit: 11, isWeekly: false, isToggle: true, gradient: 'from-indigo-500 to-blue-400', glowColor: 'rgba(99,102,241,0.3)' },
  { key: 'playing', labelKey: 'calc_q10_label', unitKey: 'calc_q10_unit', infoKey: 'calc_q10_info', icon: Gamepad2, min: 0, max: 1, defaultValue: 0, step: 1, ratePerUnit: 4, isWeekly: false, isToggle: true, gradient: 'from-pink-500 to-rose-400', glowColor: 'rgba(236,72,153,0.3)' },
];

const ALL_SLIDERS = [...STEP1_SLIDERS, ...STEP2_SLIDERS, ...STEP3_SLIDERS];

/* ===== HELPERS ===== */

function getCategory(totalDaily: number): CategoryInfo {
  if (totalDaily < 80) return CATEGORIES[0];
  if (totalDaily <= 150) return CATEGORIES[1];
  if (totalDaily <= 250) return CATEGORIES[2];
  return CATEGORIES[3];
}

function getRelevantTips(values: Record<string, number>): number[] {
  const tips: number[] = [];
  if ((values.shower ?? 10) > 10) tips.push(1);
  if (values.brushing === 1) tips.push(2);
  if ((values.toilet ?? 6) > 6) tips.push(3);
  if (values.bottles === 1) tips.push(4);
  if (values.vehicle === 1) tips.push(5);
  if (tips.length === 0) return [1, 2, 3];
  return tips;
}

function calcDailyTotal(values: Record<string, number>): number {
  return ALL_SLIDERS.reduce((sum, s) => {
    const v = values[s.key] ?? s.defaultValue;
    const daily = s.isWeekly ? (v * s.ratePerUnit) / 7 : v * s.ratePerUnit;
    return sum + daily;
  }, 0);
}

function getInitialValues(): Record<string, number> {
  const vals: Record<string, number> = {};
  for (const s of ALL_SLIDERS) vals[s.key] = s.defaultValue;
  return vals;
}

/* ===== ANIMATED COUNTER HOOK ===== */

function useAnimatedCounter(target: number, duration: number = 1200, active: boolean = true) {
  const [display, setDisplay] = useState(() => active ? 0 : target);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      // Wrap setState in rAF callback to avoid synchronous set-state-in-effect cascade
      frameRef.current = requestAnimationFrame(() => {
        setDisplay(target);
      });
      return () => cancelAnimationFrame(frameRef.current);
    }

    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      /* Smoother easing: ease-out-quart for more natural feel */
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, active]);

  return display;
}

/* ===== FLOATING BUBBLES DATA ===== */

const BUBBLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 12) + (i % 3) * 5}%`,
  bottom: `${-5 + (i % 4) * 20}%`,
  size: 4 + (i % 4) * 4,
  opacity: 0.15 + (i % 3) * 0.12,
  duration: `${8 + i * 2.5}s`,
  delay: `${i * 1.2}s`,
  drift: (i % 2 === 0 ? 15 : -10),
}));

/* ===== WATER DROPLET PARTICLES (legacy, kept for compat) ===== */

const DROPLETS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${15 + i * 14}%`,
  delay: `${i * 0.8}s`,
  duration: `${2.5 + i * 0.3}s`,
  size: 3 + (i % 3) * 2,
}));

/* ===== ANIMATED PROGRESS RING ===== */

function ProgressRing({ progress, size = 40, stroke = 3 }: { progress: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200 dark:text-gray-700" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="url(#progressGradient)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ===== RIPPLE BUTTON HOOK ===== */

function useRipple() {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'calc-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  return { ref, handleClick };
}

/* ===== SUB-COMPONENTS ===== */

const SliderItem = memo(function SliderItem({
  config, value, onChange, t, index,
}: {
  config: SliderConfig; value: number; onChange: (key: string, value: number) => void;
  t: (key: string) => string; index: number;
}) {
  const Icon = config.icon;
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;
  const litersPerDay = config.isWeekly
    ? Math.round((value * config.ratePerUnit) / 7)
    : value * config.ratePerUnit;
  const isHighValue = percentage > 50;
  const [isDragging, setIsDragging] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(config.key, Number(e.target.value));
    setWaveKey(k => k + 1);
  }, [config.key, onChange]);

  return (
    <div
      className={`calc-card-enter group relative rounded-2xl bg-white dark:bg-gray-900/60 border p-5 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 ${
        isDragging
          ? 'border-ocean-300 dark:border-ocean-600 shadow-lg shadow-ocean-500/15 ring-1 ring-ocean-400/30 dark:ring-ocean-500/20'
          : 'border-gray-100/80 dark:border-white/5 hover:border-ocean-200 dark:hover:border-ocean-700/50'
      }`}
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: isDragging ? undefined : 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.03)',
      }}
    >
      {/* Shimmer sweep on mount */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            animation: `shimmerSweep 1.2s ease-out ${index * 0.12}s forwards`,
            transform: 'translateX(-100%)',
          }}
        />
      </div>

      {/* Top accent line */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex items-center gap-3 mb-4">
        {/* Icon with floating animation */}
        <div className={`calc-icon-float w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
          <Icon className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-semibold text-ocean-900 dark:text-white leading-snug">
            {t(config.labelKey)}
          </label>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
            {t(config.infoKey)}
          </span>
        </div>
        {/* Value badge with water wave SVG */}
        <div className="shrink-0 relative">
          <div
            className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: config.glowColor }}
          />
          <div className="relative flex items-baseline gap-1 bg-gradient-to-br from-ocean-50 to-cyan-50 dark:from-ocean-900/30 dark:to-cyan-900/30 px-3.5 py-2 rounded-xl border border-ocean-100 dark:border-ocean-800/30 overflow-hidden">
            {/* Water wave inside badge */}
            <div className="calc-wave-container absolute bottom-0 left-0 right-0 h-3 pointer-events-none" aria-hidden="true">
              <svg className="calc-wave" width="200%" height="12" viewBox="0 0 200 12" preserveAspectRatio="none" key={waveKey}>
                <path
                  d="M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z"
                  fill="rgba(59,130,246,0.15)"
                />
              </svg>
            </div>
            <span className="text-xl font-black text-ocean-600 dark:text-ocean-400 tabular-nums transition-transform duration-150 relative z-10">
              {value}
            </span>
            <span className="text-[11px] font-semibold text-ocean-400 dark:text-ocean-500 relative z-10">
              {t(config.unitKey)}
            </span>
          </div>
        </div>
      </div>

      {/* Slider track - thicker (3px) rounded pill */}
      <div className="relative">
        {/* Glow behind slider */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-6 rounded-full blur-md opacity-20 transition-opacity duration-300 group-hover:opacity-40"
          style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${config.glowColor}, transparent)` }} />

        <input
          type="range" min={config.min} max={config.max} step={config.step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="calc-slider relative w-full h-[3px] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
          aria-label={t(config.labelKey)}
          aria-valuemin={config.min}
          aria-valuemax={config.max}
          aria-valuenow={value}
          suppressHydrationWarning
        />
        <div className="flex justify-between mt-2 text-[10px] font-semibold text-gray-300 dark:text-gray-700 px-0.5">
          <span>{config.min}</span>
          <span className={`text-ocean-400 dark:text-ocean-600 text-[11px] font-bold tabular-nums ${isHighValue ? 'calc-high-usage' : ''}`}>
            ≈ {litersPerDay} {t('calc_approx_liter_per_day')}
          </span>
          <span>{config.max}</span>
        </div>
      </div>
    </div>
  );
});

const StepIndicator = memo(function StepIndicator({
  current, total, t,
}: {
  current: number; total: number; t: (key: string) => string;
}) {
  const progressPercent = ((current - 1) / (total - 1)) * 100;
  /* Track which steps just completed for checkmark pop animation */
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const prevCurrent = useRef(current);

  useEffect(() => {
    if (current > prevCurrent.current) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        next.add(prevCurrent.current);
        return next;
      });
    }
    prevCurrent.current = current;
  }, [current]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const StepIcon = STEP_ICONS[i];
          const isActive = step === current;
          const isCompleted = step < current;
          const justCompleted = completedSteps.has(step);
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1.5">
                {/* Rounded pill step button */}
                <div className="relative">
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-ocean-400/20 animate-ping" />
                  )}
                  <button
                    type="button"
                    className={`relative flex items-center gap-1.5 h-11 pl-3.5 pr-3.5 rounded-full font-bold text-xs transition-all duration-500 ${
                      isActive
                        ? 'calc-breathe bg-gradient-to-r from-ocean-500 to-cyan-500 text-white shadow-lg shadow-ocean-500/30'
                        : isCompleted
                        ? 'bg-ocean-100 dark:bg-ocean-900/40 text-ocean-600 dark:text-ocean-400 border border-ocean-200 dark:border-ocean-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                    }`}
                    style={isActive ? {
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(59,130,246,0.3)',
                    } : isCompleted ? {
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.05)',
                    } : {
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Step number */}
                    <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center text-[10px]">
                      {step}
                    </span>
                    <StepIcon className="w-4 h-4" />
                    {/* Checkmark pop for completed steps */}
                    {isCompleted && (
                      <span className={`calc-check-pop ${justCompleted ? '' : '!animate-none !opacity-100 !transform-none'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-ocean-500" />
                      </span>
                    )}
                  </button>
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {t('calc_step_label')} {step}
                </span>
              </div>
              {step < total && (
                <div className="flex-1 mx-2 sm:mx-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  {/* Liquid fill progress bar */}
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-ocean-400 to-cyan-400 ${
                      isCompleted ? 'calc-liquid-fill' : 'transition-all duration-700 ease-out'
                    }`}
                    style={{ width: `${isCompleted ? 100 : isActive ? 50 : 0}%` }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Thin progress bar under indicators */}
      <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1">
        <div
          className="calc-liquid-fill h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});

/* ===== TOGGLE ITEM (Yes/No) ===== */

const ToggleItem = memo(function ToggleItem({
  config, value, onChange, t, index,
}: {
  config: SliderConfig; value: number; onChange: (key: string, value: number) => void;
  t: (key: string) => string; index: number;
}) {
  const Icon = config.icon;
  const isYes = value === 1;
  const litersPerDay = isYes ? config.ratePerUnit : 0;

  return (
    <div
      className="calc-card-enter group relative rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100/80 dark:border-white/5 p-5 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 hover:border-ocean-200 dark:hover:border-ocean-700/50"
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.03)',
      }}
    >
      {/* Shimmer sweep on mount */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            animation: `shimmerSweep 1.2s ease-out ${index * 0.12}s forwards`,
            transform: 'translateX(-100%)',
          }}
        />
      </div>

      {/* Top accent line */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex items-center gap-3 mb-4">
        <div className={`calc-icon-float w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
          <Icon className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-semibold text-ocean-900 dark:text-white leading-snug">
            {t(config.labelKey)}
          </label>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
            {t(config.infoKey)}
          </span>
        </div>
        {isYes && (
          <div className="shrink-0 relative">
            <div
              className="absolute inset-0 rounded-xl blur-md opacity-60"
              style={{ background: config.glowColor }}
            />
            <div className="relative flex items-baseline gap-1 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-3.5 py-2 rounded-xl border border-red-200/50 dark:border-red-800/30">
              <span className="text-xl font-black text-red-500 dark:text-red-400 tabular-nums">
                {litersPerDay}
              </span>
              <span className="text-[11px] font-semibold text-red-400 dark:text-red-500">
                {t('calc_liter_per_day')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Yes/No toggle buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(config.key, 1)}
          className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.97] overflow-hidden ${
            isYes
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30'
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-white/5'
          }`}
        >
          {isYes && (
            <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <span className="absolute inset-0" style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
              }} />
            </span>
          )}
          <CheckCircle2 className={`w-4 h-4 relative z-10 ${isYes ? 'text-white' : ''}`} />
          <span className="relative z-10">{t('calc_toggle_yes')}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(config.key, 0)}
          className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.97] overflow-hidden ${
            !isYes
              ? 'bg-gradient-to-r from-ocean-500 to-cyan-500 text-white shadow-lg shadow-ocean-500/25 ring-2 ring-ocean-400/30'
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-white/5'
          }`}
        >
          {!isYes && (
            <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <span className="absolute inset-0" style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
              }} />
            </span>
          )}
          <DropletOff className={`w-4 h-4 relative z-10 ${!isYes ? 'text-white' : ''}`} />
          <span className="relative z-10">{t('calc_toggle_no')}</span>
        </button>
      </div>
    </div>
  );
});

/* ===== ANIMATED BAR ===== */

function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min((value / max) * 100, 100)), 200 + delay);
    return () => clearTimeout(timer);
  }, [value, max, delay]);
  return (
    <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1200 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

/* ===== RESULTS ===== */

const ResultsView = memo(function ResultsView({
  totalDaily, values, t, onRestart, lang,
}: {
  totalDaily: number; values: Record<string, number>;
  t: (key: string) => string; onRestart: () => void; lang: 'id' | 'en';
}) {
  const category = getCategory(totalDaily);
  const TrendIcon = category.trendIcon;
  const totalMonthly = Math.round(totalDaily * 30);
  const totalYearly = Math.round(totalDaily * 365);
  const tipKeys = getRelevantTips(values);
  const showersEquiv = Math.round(totalDaily / 10.5);
  const bottlesEquiv = Math.round(totalDaily / 3);
  const bucketsEquiv = Math.round(totalDaily / 20);
  const whoPercent = Math.round((totalDaily / WHO_MINIMUM) * 100);
  const avgPercent = Math.round((totalDaily / ID_AVG) * 100);

  const animatedTotal = useAnimatedCounter(Math.round(totalDaily), 1500);
  const animatedMonthly = useAnimatedCounter(totalMonthly, 1800);
  const animatedYearly = useAnimatedCounter(totalYearly, 2000);

  const { ref: shareRef, handleClick: handleShareClick } = useRipple();
  const { ref: restartRef, handleClick: handleRestartClick } = useRipple();

  const handleShare = useCallback(async () => {
    const text = lang === 'id'
      ? `💧 Jejak Air Harianku: ${Math.round(totalDaily)} L/hari\nKategori: ${t(category.labelKey)}\n\nHitung jejak airmu di Water Savers Team!\n#JadiPerubahanHematAir #WaterSaversTeam`
      : `💧 My Daily Water Footprint: ${Math.round(totalDaily)} L/day\nCategory: ${t(category.labelKey)}\n\nCalculate yours at Water Savers Team!\n#BeTheChangeSaveWater #WaterSaversTeam`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Water Footprint Calculator', text, url: window.location.href }); } catch { /* */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = lang === 'id' ? 'Hasil berhasil disalin! 💧' : 'Result copied! 💧';
      document.body.appendChild(toast);
      setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 500); }, 2500);
    }
  }, [totalDaily, category, t, lang]);

  return (
    <div className="space-y-5">
      {/* Main result — hero card */}
      <div className={`result-card relative rounded-3xl border-2 ${category.borderClass} ${category.bgClass} p-8 md:p-10 text-center overflow-hidden`}>
        {/* Animated water wave SVG behind the big number */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="calc-wave absolute bottom-0 w-[200%] h-16 opacity-20" viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path
              d="M0 30 C240 10 480 50 720 30 C960 10 1200 50 1440 30 V60 H0 Z"
              fill={category.barColor}
            />
          </svg>
          <svg className="calc-wave absolute bottom-0 w-[200%] h-12 opacity-10" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ animationDelay: '-3s', animationDuration: '5s' }}>
            <path
              d="M0 25 C360 45 720 5 1080 25 C1260 35 1380 15 1440 25 V60 H0 Z"
              fill={category.barColor}
            />
          </svg>
        </div>

        {/* Animated bg circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 dark:opacity-10 calc-orbit" style={{ background: category.barColor }} />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-15 dark:opacity-8 calc-orbit-reverse" style={{ background: category.barColor }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 dark:opacity-3" style={{ background: category.barColor }} />

        <div className="relative z-10">
          {/* Category badge — bounces in with overshoot */}
          <div className="calc-pop-in inline-flex items-center gap-2 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-sm font-bold px-5 py-2.5 rounded-full mb-5 shadow-sm"
            style={{ animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <span className="text-lg">{category.emoji}</span>
            <TrendIcon className="w-4 h-4" />
            <span>{t(category.labelKey)}</span>
          </div>

          {/* Big number with orbiting droplets */}
          <div className="relative inline-block mb-1">
            {/* Ring of 6 animated droplets */}
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="calc-orbit-dot absolute w-2 h-2 rounded-full"
                style={{
                  background: category.barColor,
                  opacity: 0.5 + (i % 2) * 0.2,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${4 + i * 0.5}s`,
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px',
                }}
              />
            ))}

            <span className="text-6xl md:text-8xl font-black tabular-nums bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-500 bg-clip-text text-transparent">
              {animatedTotal}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-ocean-400 dark:text-ocean-500 ml-1.5">L</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
            {t('calc_result_daily')}
          </p>

          {/* Monthly / Yearly row — smoother count-up */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="calc-pop-in bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-200/30 dark:border-white/5" style={{ animationDelay: '200ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)' }}>
              <span className="block text-xl sm:text-2xl font-bold text-ocean-700 dark:text-ocean-300 tabular-nums">{animatedMonthly.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">{t('calc_result_monthly')}</span>
            </div>
            <div className="calc-pop-in bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-200/30 dark:border-white/5" style={{ animationDelay: '350ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)' }}>
              <span className="block text-xl sm:text-2xl font-bold text-ocean-700 dark:text-ocean-300 tabular-nums">{animatedYearly.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">{t('calc_result_yearly')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="calc-pop-in rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 p-5 hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5" style={{ animationDelay: '400ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">WHO</span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{whoPercent}%</p>
            </div>
          </div>
          <AnimatedBar value={totalDaily} max={WHO_MINIMUM} color={totalDaily <= WHO_MINIMUM ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #10b981, #f59e0b)'} />
        </div>

        <div className="calc-pop-in rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 p-5 hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5" style={{ animationDelay: '500ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Indonesia</span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{avgPercent}%</p>
            </div>
          </div>
          <AnimatedBar value={totalDaily} max={ID_AVG} color={totalDaily <= ID_AVG ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #3b82f6, #f97316)'} delay={150} />
        </div>
      </div>

      {/* Equivalent comparisons */}
      <div className="calc-pop-in rounded-2xl bg-gradient-to-br from-ocean-50 to-cyan-50 dark:from-ocean-950/40 dark:to-cyan-950/40 border border-ocean-200/50 dark:border-ocean-800/30 p-5" style={{ animationDelay: '600ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.02)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-4 h-4 text-ocean-500" />
          <span className="text-sm font-bold text-ocean-800 dark:text-ocean-300">{t('calc_result_daily')}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShowerHead, val: showersEquiv, key: 'calc_equiv_showers', color: 'text-blue-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
            { icon: Recycle, val: bottlesEquiv, key: 'calc_equiv_bottles', color: 'text-violet-500', bg: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20' },
            { icon: Bath, val: bucketsEquiv, key: 'calc_equiv_buckets', color: 'text-cyan-500', bg: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20' },
          ].map((item) => (
            <div key={item.key} className={`text-center bg-gradient-to-br ${item.bg} rounded-xl py-3.5 px-2 border border-white/60 dark:border-white/5`}>
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1.5`} />
              <span className="block text-2xl font-black text-ocean-900 dark:text-white tabular-nums">{item.val}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-tight">{t(item.key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips — slide in from left one by one */}
      <div className="calc-pop-in rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 p-5" style={{ animationDelay: '700ms', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-ocean-900 dark:text-white">{t('calc_tip_prefix')}</span>
        </div>
        <ul className="space-y-3">
          {tipKeys.map((tipNum, i) => (
            <li
              key={tipNum}
              className="flex items-start gap-3 calc-pop-in"
              style={{
                animationDelay: `${800 + i * 150}ms`,
                animationName: 'cardSlideUp',
              }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t(`calc_tip${tipNum}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Share Results — gradient border animation */}
        <div className="relative flex-1 group">
          <div
            className="absolute -inset-[2px] rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'conic-gradient(from var(--border-angle, 0deg), #3b82f6, #06b6d4, #8b5cf6, #ec4899, #3b82f6)',
              animation: 'rotateBorder 3s linear infinite',
            }}
            aria-hidden="true"
          />
          <button
            ref={shareRef}
            onClick={(e) => { handleShareClick(e); handleShare(); }}
            className="calc-shimmer-btn relative w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-ocean-500 to-cyan-500 hover:from-ocean-600 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl px-5 py-3.5 transition-all duration-500 hover:shadow-lg hover:shadow-ocean-500/25 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 overflow-hidden"
          >
            <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <span className="absolute inset-0" style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                animation: 'shimmerSweep 2.5s ease-in-out infinite',
              }} />
            </span>
            <Share2 className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t('calc_share_text')}</span>
          </button>
        </div>
        <button
          ref={restartRef}
          onClick={(e) => { handleRestartClick(e); onRestart(); }}
          className="flex-1 inline-flex items-center justify-center gap-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-ocean-900 dark:text-white font-semibold text-sm rounded-xl px-5 py-3.5 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 overflow-hidden"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.05)' }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('calc_restart')}</span>
        </button>
      </div>
    </div>
  );
});

/* ===== MAIN COMPONENT ===== */

function WaterFootprintCalculator() {
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<Record<string, number>>(getInitialValues);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(currentStep);

  const totalSteps = 4;
  const totalDaily = useMemo(() => calcDailyTotal(values), [values]);
  const animatedLiveTotal = useAnimatedCounter(Math.round(totalDaily), 400);

  const handleChange = useCallback((key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* Navigation with ripple support — destructure to avoid ESLint refs-during-render */
  const { ref: prevBtnRef, handleClick: prevBtnRipple } = useRipple();
  const { ref: nextBtnRef, handleClick: nextBtnRipple } = useRipple();

  const goNext = useCallback(() => {
    if (currentStep >= totalSteps) return;
    setDirection('forward');
    setIsVisible(false);
    setTimeout(() => {
      stepRef.current = currentStep + 1;
      setCurrentStep((s) => s + 1);
      setIsVisible(true);
      if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep <= 1) return;
    setDirection('backward');
    setIsVisible(false);
    setTimeout(() => {
      stepRef.current = currentStep - 1;
      setCurrentStep((s) => s - 1);
      setIsVisible(true);
    }, 400);
  }, [currentStep]);

  const handleRestart = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setValues(getInitialValues());
      setCurrentStep(1);
      stepRef.current = 1;
      setDirection('backward');
      setIsVisible(true);
    }, 400);
  }, []);

  const sliderSets = [STEP1_SLIDERS, STEP2_SLIDERS, STEP3_SLIDERS];
  const stepGradient = STEP_GRADIENTS[currentStep - 1];

  /* Step transitions: 400ms spring cubic-bezier with vertical slide */
  const slideClass = isVisible
    ? 'opacity-100 translate-x-0 translate-y-0 scale-100'
    : direction === 'forward'
      ? 'opacity-0 translate-x-8 translate-y-[-12px] scale-[0.98]'
      : 'opacity-0 -translate-x-8 translate-y-[12px] scale-[0.98]';

  return (
    <section aria-labelledby="calc-heading" className="relative py-24 overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400" aria-hidden="true" />

      {/* Background: mesh gradient + noise texture + floating bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 opacity-60 dark:opacity-40" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.05) 0%, transparent 50%)',
        }} />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
          backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.08) 0% 25%, transparent 0% 50%)',
          backgroundSize: '4px 4px',
        }} />
        {/* Floating blur blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-ocean-200/15 dark:bg-ocean-800/8 rounded-full blur-3xl fl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/15 dark:bg-cyan-800/8 rounded-full blur-3xl fld" />

        {/* 8 floating bubbles */}
        {BUBBLES.map((b) => (
          <div
            key={b.id}
            className="calc-bubble absolute rounded-full bg-gradient-to-b from-cyan-300/30 to-blue-400/15 dark:from-cyan-400/15 dark:to-blue-500/8"
            style={{
              left: b.left,
              bottom: b.bottom,
              width: `${b.size}px`,
              height: `${b.size}px`,
              opacity: b.opacity,
              animationDuration: b.duration,
              animationDelay: b.delay,
              '--bubble-drift': `${b.drift}px`,
            } as React.CSSProperties}
          />
        ))}

        {/* Legacy water drops (kept) */}
        {DROPLETS.map((d) => (
          <div key={d.id} className="absolute calc-drop" style={{ left: d.left, bottom: '10%' }}>
            <div
              className="w-2.5 rounded-full bg-gradient-to-b from-cyan-300/40 to-blue-400/20"
              style={{ height: `${d.size}px`, animationDelay: d.delay, animationDuration: d.duration }}
            />
          </div>
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-10 anim-blur">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full mb-5 border border-cyan-200/50 dark:border-cyan-800/30">
            <Calculator className="h-4 w-4" />
            <span>{t('calc_section_badge')}</span>
          </div>
          <h2 id="calc-heading" className="text-3xl sm:text-4xl md:text-5xl font-black text-ocean-900 dark:text-white tracking-tight mb-3">
            <span className="tg">{t('calc_section_title_1')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {t('calc_section_title_2')}
          </p>
        </div>

        {/* Calculator card */}
        <div
          ref={containerRef}
          className="anim calc-main-card bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100/80 dark:border-white/5 shadow-2xl shadow-ocean-900/5 dark:shadow-ocean-950/30 p-5 sm:p-6 md:p-8 overflow-hidden max-h-[85vh] overflow-y-auto"
        >
          {/* Step indicator */}
          <StepIndicator current={currentStep} total={totalSteps} t={t} />

          {/* Step header */}
          <div className="mb-6 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stepGradient} flex items-center justify-center shadow-md`}>
              {(() => { const Icon = STEP_ICONS[currentStep - 1]; return <Icon className="w-5 h-5 text-white" />; })()}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-ocean-900 dark:text-white">
                {t(STEP_TITLES[currentStep - 1])}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {currentStep <= 3
                  ? `${t('calc_step_label')} ${currentStep} / ${totalSteps - 1}`
                  : t('calc_step4_title')}
              </p>
            </div>
          </div>

          {/* Step content with transitions — 400ms spring */}
          <div className={`transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${slideClass}`}>
            {currentStep <= 3 && (
              <div className="space-y-4">
                {sliderSets[currentStep - 1].map((slider, i) =>
                  slider.isToggle ? (
                    <ToggleItem
                      key={slider.key}
                      config={slider}
                      value={values[slider.key] ?? slider.defaultValue}
                      onChange={handleChange}
                      t={t}
                      index={i}
                    />
                  ) : (
                    <SliderItem
                      key={slider.key}
                      config={slider}
                      value={values[slider.key] ?? slider.defaultValue}
                      onChange={handleChange}
                      t={t}
                      index={i}
                    />
                  )
                )}
              </div>
            )}

            {currentStep === 4 && (
              <ResultsView
                totalDaily={totalDaily}
                values={values}
                t={t}
                onRestart={handleRestart}
                lang={lang}
              />
            )}
          </div>

          {/* Navigation */}
          {currentStep <= 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
              <button
                ref={prevBtnRef}
                onClick={(e) => { prevBtnRipple(e); goPrev(); }}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-2 font-semibold text-sm rounded-xl px-4 py-3 transition-all duration-500 active:scale-[0.97] overflow-hidden ${
                  currentStep === 1
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-ocean-900 dark:text-white hover:shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('calc_prev')}</span>
              </button>

              {/* Live water usage indicator with wiggling droplet */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-ocean-50 to-cyan-50 dark:from-ocean-900/20 dark:to-cyan-900/20 border border-ocean-100 dark:border-ocean-800/20">
                <div className="relative">
                  <Droplets className="w-4 h-4 text-ocean-500" style={{ animation: 'iconFloat 2s ease-in-out infinite' }} />
                </div>
                <span className="text-sm font-black text-ocean-600 dark:text-ocean-400 tabular-nums">
                  {animatedLiveTotal}
                </span>
                <span className="text-[11px] font-semibold text-ocean-400 dark:text-ocean-500">{t('calc_liter_per_day')}</span>
              </div>

              {/* Next button with shimmer sweep */}
              <button
                ref={nextBtnRef}
                onClick={(e) => { nextBtnRipple(e); goNext(); }}
                className="calc-shimmer-btn inline-flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-cyan-500 hover:from-ocean-600 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl px-4 py-3 transition-all duration-500 hover:shadow-lg hover:shadow-ocean-500/25 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 overflow-hidden"
              >
                <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  <span className="absolute inset-0" style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmerSweep 2.5s ease-in-out infinite',
                  }} />
                </span>
                <span className="relative z-10">{currentStep === 3 ? t('calc_share_text').split(' ')[0] : t('calc_next')}</span>
                <ChevronRight className="w-4 h-4 relative z-10" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(WaterFootprintCalculator);
