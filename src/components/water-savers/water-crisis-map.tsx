'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from 'next-themes';
import {
  provinces,
  INDONESIA_BOUNDS,
  INDONESIA_CENTER,
  STRESS_LEVELS,
  type ProvinceData,
} from '@/data/water-crisis-data';
import {
  MapPin, Droplets, ChevronUp, Loader2, Maximize2, Minimize2,
  X, Users, Droplet, AlertTriangle, Shield, Wind, TrendingUp,
  Activity, Globe2, ThermometerSun,
} from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Framer Motion Variant Presets ──────────────────────────
const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94] as const;

const staggerContainer = (stagger = 0.12) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

const fadeSlideUp = (duration = 0.6, stagger = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT_QUART } },
});

const itemFadeSlideUp = (duration = 0.6) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT_QUART } },
});

const headerItemVariants = itemFadeSlideUp(0.6);
const statsItemVariants = itemFadeSlideUp(0.5);

/** Invalidate Leaflet map size on fullscreen change or container resize */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const onFsChange = () => setTimeout(() => map.invalidateSize(), 200);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    // Also resize via ResizeObserver (catches mobile fullscreen CSS changes)
    const container = map.getContainer().parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(() => map.invalidateSize(), 100);
      });
      resizeObserver.observe(container);
    }

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      resizeObserver?.disconnect();
    };
  }, [map]);
  return null;
}

/** Component to lock map bounds to Indonesia + control interactions based on fullscreen */
function MapBoundsLocker({ locked }: { locked: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(INDONESIA_BOUNDS);
    map.setMinZoom(4);
    map.setMaxZoom(12);
    map.setView(INDONESIA_CENTER, 5);
  }, [map]);

  useEffect(() => {
    if (locked) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [map, locked]);

  return null;
}

// ─── HTML escape helper (prevents XSS in Leaflet tooltips) ──────────────────
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Animated Circular Gauge ──────────────────────────────────────────────

function CircularGauge({ value, color, delay = 0, size = 80, isDark = false }: {
  value: number; color: string; delay?: number; size?: number; isDark?: boolean;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-sm font-extrabold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring', damping: 12, stiffness: 180 }}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}

// ─── Smooth Animated Progress Bar ─────────────────────────────────────────────

function SmoothBar({ value, color, delay = 0, height = 'h-2', isDark = false }: {
  value: number; color: string; delay?: number; height?: string; isDark?: boolean;
}) {
  return (
    <div className={`relative ${height} w-full rounded-full overflow-hidden`}
      style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%`, backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ width: { duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }, backgroundPosition: { duration: 2.5, delay: delay + 1.4, repeat: Infinity, ease: 'linear' } }}
      />
    </div>
  );
}

// (isDarkGlobal removed — now passed as prop to avoid race condition)

// ─── Province Detail Panel ────────────────────────────────────────────────────

function ProvinceDetailPanel({
  province, lang, isDark, onClose,
}: {
  province: ProvinceData; lang: 'id' | 'en'; isDark: boolean; onClose: () => void;
}) {
  const level = STRESS_LEVELS[province.stressLevel as keyof typeof STRESS_LEVELS];
  const name = lang === 'id' ? province.name_id : province.name_en;
  const issue = lang === 'id' ? province.issue_id : province.issue_en;
  const levelLabel = lang === 'id' ? level.label_id : level.label_en;
  const stressLabel = lang === 'id' ? 'Stres Air' : 'Water Stress';
  const popLabel = lang === 'id' ? 'Populasi' : 'Population';
  const accessLabel = lang === 'id' ? 'Akses Air Bersih' : 'Clean Water Access';
  const issueLabel = lang === 'id' ? 'Masalah Utama' : 'Key Issue';
  const srcText = lang === 'id'
    ? 'Sumber: BMKG 2025, WRI Aqueduct 4.0, BPS Susenas 2024/2025'
    : 'Source: BMKG 2025, WRI Aqueduct 4.0, BPS Susenas 2024/2025';

  const waterColor = province.accessCleanWater >= 85
    ? '#10b981'
    : province.accessCleanWater >= 70
      ? '#f59e0b'
      : '#ef4444';

  const isCritical = province.stressLevel >= 3;

  // Smooth reveal: each child fades + slides in sequence
  const reveal = {
    container: staggerContainer(0.07),
    item: {
      hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE_OUT_QUART } },
    },
  };

  return (
    <>
      {/* Backdrop — soft fade + blur */}
      <motion.div
        className="absolute inset-0 z-[1005]"
        style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={onClose}
      />

      {/* Panel — slide from right with spring physics */}
      <motion.div
        className="absolute top-0 right-0 bottom-0 z-[1006] w-full sm:w-[420px] flex flex-col overflow-hidden"
        initial={{ x: '105%' }}
        animate={{ x: 0 }}
        exit={{ x: '105%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.85 }}
      >
        <div className={`flex-1 flex flex-col overflow-hidden relative ${
          isDark ? 'bg-[#0c0e14]/95' : 'bg-white/95'
        } backdrop-blur-2xl shadow-2xl` }>

          {/* Ambient glow behind header — soft radial */}
          <motion.div
            className="absolute -top-32 -right-32 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${level.color}18 0%, transparent 65%)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          {/* Secondary glow bottom-left */}
          <motion.div
            className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${waterColor}12 0%, transparent 65%)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Top accent line — animated reveal */}
          <motion.div
            className="h-[3px] w-full flex-shrink-0"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${level.color}40 20%, ${level.color} 50%, ${level.color}40 80%, transparent 100%)` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Header */}
          <motion.div
            className="flex-shrink-0 px-6 pt-6 pb-4 relative"
            variants={reveal.container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={reveal.item} className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Status pill with pulse */}
                <motion.div
                  variants={reveal.item}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3`}
                  style={{
                    backgroundColor: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                    color: isCritical ? '#ef4444' : '#f97316',
                    border: `1px solid ${isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)'}`,
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {isCritical && (
                      <motion.span
                        className="absolute inline-flex h-full w-full rounded-full"
                        style={{ backgroundColor: '#ef4444' }}
                        animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                      style={{ backgroundColor: isCritical ? '#ef4444' : '#f97316' }}
                    />
                  </span>
                  {isCritical
                    ? (lang === 'id' ? 'Krisis' : 'Crisis')
                    : (lang === 'id' ? 'Waspada' : 'Alert')}
                </motion.div>

                {/* Province name */}
                <motion.h3
                  variants={reveal.item}
                  className={`text-[22px] font-extrabold leading-tight mb-2.5 tracking-tight ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {name}
                </motion.h3>

                {/* Level badge */}
                <motion.div variants={reveal.item} className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${level.color}12`,
                      color: level.color,
                      border: `1px solid ${level.color}20`,
                    }}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {levelLabel}
                  </span>
                </motion.div>
              </div>

              {/* Close button */}
              <motion.button
                variants={reveal.item}
                onClick={onClose}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-white/10 text-gray-500 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
                }`}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', damping: 18, stiffness: 380 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stress Score + Gauge — centered layout */}
          <motion.div
            className="flex-shrink-0 px-6 pb-5"
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={`rounded-2xl p-5 border flex items-center gap-5 ${
              isDark
                ? 'bg-white/[0.03] border-white/[0.05]'
                : 'bg-gray-50/60 border-gray-100'
            }`}>
              <CircularGauge value={province.stressScore} color={level.color} delay={0.25} size={76} isDark={isDark} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${level.color}12` }}>
                    <Shield className="w-3 h-3" style={{ color: level.color }} />
                  </div>
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stressLabel}
                  </span>
                </div>
                <SmoothBar value={province.stressScore} color={level.color} delay={0.35} height="h-2" isDark={isDark} />
                <div className="flex justify-between mt-1.5 px-0.5">
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <span key={pct} className={`text-[9px] tabular-nums ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                      {pct}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid — population & water access */}
          <motion.div
            className="flex-shrink-0 px-6 pb-5 grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={reveal.container}
          >
            <motion.div
              variants={reveal.item}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`rounded-xl p-4 border cursor-default ${
                isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/60 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-500/10">
                  <Users className="w-3 h-3 text-violet-500" />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {popLabel}
                </span>
              </div>
              <p className={`text-xl font-extrabold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {province.population_millions}<span className="text-xs font-semibold text-gray-400 ml-0.5">M</span>
              </p>
            </motion.div>

            <motion.div
              variants={reveal.item}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`rounded-xl p-4 border cursor-default ${
                isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50/60 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${waterColor}12` }}>
                  <Droplet className="w-3 h-3" style={{ color: waterColor }} />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {accessLabel}
                </span>
              </div>
              <p className={`text-xl font-extrabold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {province.accessCleanWater}<span className="text-xs font-semibold text-gray-400 ml-0.5">%</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Water Access Bar */}
          <motion.div
            className="flex-shrink-0 px-6 pb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <SmoothBar value={province.accessCleanWater} color={waterColor} delay={0.5} height="h-1.5" isDark={isDark} />
          </motion.div>

          {/* Animated divider */}
          <motion.div
            className="flex-shrink-0 mx-6"
            style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Issue Card */}
          <motion.div
            className="flex-1 min-h-0 px-6 py-5 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <motion.div
              className={`rounded-2xl p-4 border ${
                isDark
                  ? 'bg-white/[0.03] border-white/[0.05]'
                  : 'bg-amber-50/40 border-amber-100/40'
              }`}
              initial={{ y: 14, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-amber-500/10' : 'bg-amber-100/80'
                }`}>
                  <Wind className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {issueLabel}
                </span>
              </div>
              <p className={`text-[13px] leading-[1.7] ${
                isDark ? 'text-gray-300/90' : 'text-gray-600'
              }`}>
                {issue}
              </p>
            </motion.div>

            {/* Source */}
            <motion.p
              className={`text-[10px] mt-5 text-right flex items-center justify-end gap-1 ${
                isDark ? 'text-gray-600' : 'text-gray-300'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <TrendingUp className="w-3 h-3" />
              {srcText}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Map Component ───────────────────────────────────────────────────────

export default function WaterCrisisMap() {
  const { t, lang } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const showExpandedMap = isFullscreen || isMobileFullscreen;

  useEffect(() => {
    setIsDark(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // Fetch GeoJSON
  useEffect(() => {
    const controller = new AbortController();
    fetch('/indonesia-38-provinces.geojson', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load GeoJSON:', err);
        }
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Fullscreen state sync (Native Fullscreen API — desktop)
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) setIsMobileFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Close panel / exit mobile fullscreen on ESC / back button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileFullscreen) {
          setIsMobileFullscreen(false);
        } else {
          setSelectedProvince(null);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileFullscreen]);

  // Lock body scroll when mobile fullscreen is active
  useEffect(() => {
    if (isMobileFullscreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Try to scroll the map into view
      mapContainerRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsMobileFullscreen(false);
    } else if (isMobileFullscreen) {
      setIsMobileFullscreen(false);
    } else {
      // Try native fullscreen API first
      const el = mapContainerRef.current as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Native API failed or unsupported — use mobile fallback
          setIsMobileFullscreen(true);
        });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen().catch(() => {
          setIsMobileFullscreen(true);
        });
      } else {
        // No fullscreen API — use mobile fallback
        setIsMobileFullscreen(true);
      }
    }
  }, [isFullscreen, isMobileFullscreen]);

  // CARTO tiles WITHOUT labels
  const tileBaseUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  // Faint label overlay (very low opacity)
  const tileLabelsUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  // Build lookup map
  const provinceLookup = useMemo(() => {
    const map = new Map<string, ProvinceData>();
    for (const p of provinces) {
      const key = p.geojson_id || String(p.kode_prov);
      map.set(key, p);
    }
    return map;
  }, []);

  const crisisStats = useMemo(() => {
    const highCrisis = provinces.filter((p) => p.stressLevel >= 3);
    const totalPop = highCrisis.reduce((sum, p) => sum + p.population_millions, 0);
    return { count: highCrisis.length, totalPop: Math.round(totalPop) };
  }, []);

  const nationalAccess = 93.22;

  const getStyle = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      if (!feature) {
        return { fillColor: '#d1d5db', fillOpacity: 0.4, color: 'rgba(0,0,0,0.1)', weight: 1 };
      }
      const featureId = String(feature.properties?.id || feature.properties?.KODE_PROV);
      const prov = provinceLookup.get(featureId);
      if (!prov) {
        return {
          fillColor: '#d1d5db',
          fillOpacity: 0.4,
          color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          weight: 1,
        };
      }

      if (selectedLevel !== null && prov.stressLevel !== selectedLevel) {
        return {
          fillColor: isDark ? '#374151' : '#e5e7eb',
          fillOpacity: 0.3,
          color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          weight: 0.5,
        };
      }

      const level = STRESS_LEVELS[prov.stressLevel as keyof typeof STRESS_LEVELS];
      const isHovered = hoveredProvince === featureId;
      const isSelected = selectedProvince?.id === prov.id;

      return {
        fillColor: level.color,
        fillOpacity: isSelected ? 0.95 : isHovered ? 0.85 : 0.65,
        color: isSelected
          ? level.color
          : isHovered
            ? '#ffffff'
            : isDark
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(0,0,0,0.15)',
        weight: isSelected ? 3 : isHovered ? 2.5 : 1,
      };
    },
    [provinceLookup, selectedLevel, isDark, hoveredProvince, selectedProvince]
  );

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const featureId = String(feature.properties?.id || feature.properties?.KODE_PROV);
      const prov = provinceLookup.get(featureId);

      layer.on({
        click: () => {
          if (prov) setSelectedProvince(prov);
        },
        mouseover: (e: L.LeafletMouseEvent) => {
          setHoveredProvince(featureId);
          const target = e.target as L.Path;
          target.bringToFront();
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          setHoveredProvince(null);
          const target = e.target as L.Path;
          target.closeTooltip();
        },
        mousemove: (e: L.LeafletMouseEvent) => {
          if (prov) {
            const name = lang === 'id' ? prov.name_id : prov.name_en;
            const level = STRESS_LEVELS[prov.stressLevel as keyof typeof STRESS_LEVELS];
            const levelLabel = lang === 'id' ? level.label_id : level.label_en;
            const safeName = escapeHtml(name);
            const safeLevelLabel = escapeHtml(levelLabel);
            const target = e.target as L.Path;
            target.bindTooltip(
              `<div class="tt-label"><span class="tt-name">${safeName}</span><span class="tt-sep"> — </span><span class="tt-level" style="color:${level.color}">${safeLevelLabel}</span></div>`,
              {
                sticky: true,
                direction: 'top',
                offset: [0, -10],
                className: 'province-tooltip',
              }
            ).openTooltip();
          }
        },
      });
    },
    [provinceLookup, lang]
  );

  return (
    <section id="peta" className="relative py-20 sm:py-28 overflow-hidden animate-on-scroll">
      {/* Animated gradient border + glow keyframes */}
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes gradient-rotate {
          to { --gradient-angle: 360deg; }
        }
        .gradient-border-animate {
          background: conic-gradient(from var(--gradient-angle), #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #f43f5e);
          animation: gradient-rotate 3s linear infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .map-glow {
          animation: glow-pulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* Dramatic gradient mesh background + dot pattern overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/50" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)' }} />
        <div className="absolute top-[30%] right-[15%] w-[40%] h-[40%] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 65%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(100,116,139,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header — redesigned with staggered animations */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer(0.12)}
        >
          {/* Badge with animated conic gradient border & glass effect */}
          <motion.div variants={headerItemVariants} className="inline-flex mb-5">
            <div className="gradient-border-animate rounded-full p-[1.5px]">
              <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <Droplet className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-bold tracking-wider uppercase text-rose-600 dark:text-rose-400">
                  {t('map_badge')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Title with gradient text & subtle glow */}
          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
            style={{ textShadow: '0 0 40px rgba(244,63,94,0.12)' }}
          >
            {t('map_title_before')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
              {t('map_title_accent')}
            </span>
          </motion.h2>

          {/* Description with fade-in delay */}
          <motion.p
            variants={headerItemVariants}
            className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed"
          >
            {t('map_desc')}
          </motion.p>

          {/* Decorative divider line */}
          <motion.div
            variants={headerItemVariants}
            className="mt-8 mx-auto w-48 h-[2px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.3), rgba(249,115,22,0.3), transparent)' }}
          />
        </motion.div>

        {/* Stats bar — 4 animated glass morphism cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer(0.1)}
        >
          {/* Card 1: Total Provinces */}
          <motion.div
            variants={statsItemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-xl p-4 sm:p-5 cursor-default overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), transparent 60%)' }} />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">{provinces.length}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">{t('map_stat_provinces')}</div>
            </div>
          </motion.div>

          {/* Card 2: High Stress Provinces */}
          <motion.div
            variants={statsItemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-xl p-4 sm:p-5 cursor-default overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06), transparent 60%)' }} />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 tabular-nums">{crisisStats.count}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">{t('map_stat_crisis')}</div>
            </div>
          </motion.div>

          {/* Card 3: Affected Population */}
          <motion.div
            variants={statsItemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-xl p-4 sm:p-5 cursor-default overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), transparent 60%)' }} />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{crisisStats.totalPop}<span className="text-sm font-semibold text-gray-400 ml-0.5">M</span></div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">{t('map_stat_affected')}</div>
            </div>
          </motion.div>

          {/* Card 4: National Water Access */}
          <motion.div
            variants={statsItemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-xl p-4 sm:p-5 cursor-default overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), transparent 60%)' }} />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                <Droplet className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{nationalAccess.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2 })}<span className="text-sm font-semibold text-gray-400 ml-0.5">%</span></div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">{t('map_stat_access')}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Map container with animated glow border */}
        <div className="relative animate-on-scroll">
          {/* Subtle animated glow frame around the map */}
          {!showExpandedMap && (
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none map-glow" style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.4), rgba(244,63,94,0.2), rgba(249,115,22,0.35), rgba(59,130,246,0.2))',
            }} />
          )}
          <div
            ref={mapContainerRef}
            className={`relative overflow-hidden shadow-xl border border-gray-200/80 dark:border-white/10 transition-all duration-300 ${
              showExpandedMap
                ? 'fixed inset-0 z-[9999] rounded-none border-0'
                : 'rounded-2xl'
            }`}
            style={showExpandedMap ? { paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' } : undefined}
          >
            {/* Filter bar — only visible in fullscreen mode */}
            {showExpandedMap && (
            <div className="absolute top-0 left-0 right-0 z-[1000] p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-gray-200/50 dark:border-white/10">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 whitespace-nowrap">
                  {t('map_filter_label')}:
                </span>
                <button
                  onClick={() => setSelectedLevel(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedLevel === null
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  {t('map_filter_all')}
                </button>
                {Object.entries(STRESS_LEVELS).map(([level, data]) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(selectedLevel === Number(level) ? null : Number(level))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedLevel === Number(level)
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/15'
                    }`}
                    style={
                      selectedLevel === Number(level)
                        ? { backgroundColor: data.color }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="hidden sm:inline">
                      {lang === 'id' ? data.label_id : data.label_en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Leaflet Map */}
            <div className={`relative ${showExpandedMap ? 'h-[100dvh]' : 'h-[420px] sm:h-[520px] lg:h-[600px]'} [&_.leaflet-container]:!z-0`}>
              {!loading && geoJsonData ? (
                <MapContainer
                  center={INDONESIA_CENTER}
                  zoom={5}
                  className="h-full w-full"
                  zoomControl={false}
                  attributionControl={true}
                  style={{ background: isDark ? '#1a1a2e' : '#e8e4df' }}
                >
                  <MapBoundsLocker locked={!showExpandedMap} />
                  <MapResizer />
                  <TileLayer url={tileBaseUrl} attribution={tileAttribution} />
                  {/* Faint label overlay */}
                  <TileLayer url={tileLabelsUrl} opacity={0.25} />
                  {showExpandedMap && <ZoomControl position="bottomright" />}
                  <GeoJSON
                    key={`${selectedLevel}-${isDark}-${lang}-${selectedProvince?.id}`}
                    data={geoJsonData}
                    style={getStyle}
                    onEachFeature={onEachFeature}
                  />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {lang === 'id' ? 'Memuat peta Indonesia...' : 'Loading Indonesia map...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Province Detail Panel (overlay) */}
            <AnimatePresence>
              {selectedProvince && (
                <ProvinceDetailPanel
                  province={selectedProvince}
                  lang={lang}
                  isDark={isDark}
                  onClose={() => setSelectedProvince(null)}
                />
              )}
            </AnimatePresence>

            {/* Bottom-left controls: Legend + Fullscreen */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2">
              {/* Legend — only visible in fullscreen */}
              {showExpandedMap && (
              <>
              <button
                onClick={() => setLegendExpanded(!legendExpanded)}
                className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-gray-200/50 dark:border-white/10 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {t('map_legend_title')}
                </span>
                <ChevronUp
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${legendExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {legendExpanded && (
                <div className="mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-lg border border-gray-200/50 dark:border-white/10 space-y-1.5">
                  {Object.entries(STRESS_LEVELS).map(([level, data]) => (
                    <div key={level} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        {lang === 'id' ? data.label_id : data.label_en}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {level === '0' ? '<10' : level === '1' ? '10-20' : level === '2' ? '20-30' : level === '3' ? '30-40' : level === '4' ? '40-60' : '>60'}%
                      </span>
                    </div>
                  ))}
                  <div className="pt-1.5 mt-1.5 border-t border-gray-100 dark:border-white/10">
                    <p className="text-[10px] text-gray-400 italic">
                      {lang === 'id'
                        ? 'Warna menunjukkan level stres air di setiap provinsi'
                        : 'Colors show water stress level per province'}
                      </p>
                  </div>
                </div>
              )}
              </>
              )}
              {/* Fullscreen toggle button — always visible */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-gray-200/50 dark:border-white/10 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                aria-label={showExpandedMap
                  ? (lang === 'id' ? 'Keluar dari layar penuh' : 'Exit fullscreen')
                  : (lang === 'id' ? 'Layar penuh' : 'Fullscreen')
                }
                title={showExpandedMap
                  ? (lang === 'id' ? 'Keluar dari layar penuh' : 'Exit fullscreen')
                  : (lang === 'id' ? 'Layar penuh' : 'Fullscreen')
                }
              >
                {showExpandedMap
                  ? <Minimize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  : <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                }
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {showExpandedMap
                    ? (lang === 'id' ? 'Kecilkan' : 'Exit')
                    : (lang === 'id' ? 'Layar Penuh' : 'Fullscreen')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Source note — redesigned with icons */}
        <div className="mt-6 flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <Activity className="w-3 h-3 text-cyan-400/70" />
            <span>WRI Aqueduct 4.0</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <ThermometerSun className="w-3 h-3 text-orange-400/70" />
            <span>BMKG 2025</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <Globe2 className="w-3 h-3 text-blue-400/70" />
            <span>BPS Susenas 2024/2025</span>
          </div>
        </div>
      </div>
    </section>
  );
}
