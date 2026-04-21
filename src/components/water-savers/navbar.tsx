'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Droplets, AlertTriangle, Share2, Copy, Check, X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-animations';
import { usePanelStore } from '@/stores/panel-store';
import ThemeToggle from './theme-toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const NAV_LINKS = [
  { href: '#penyebab', labelKey: 'nav_cause' },
  { href: '#data', labelKey: 'nav_data' },
  { href: '#langkah', labelKey: 'nav_steps' },
  { href: '#dampak', labelKey: 'nav_impact' },
] as const;

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { showToast } = useToast();
  const { activePanel, openPanel, closePanel } = usePanelStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCausePopup, setShowCausePopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langKey, setLangKey] = useState(0);
  const prevLang = useRef(lang);

  // Language toggle drag
  const langToggleRef = useRef<HTMLDivElement>(null);
  const langDragRef = useRef({ active: false, startX: 0, baseLang: 'id' as 'id' | 'en', offset: 0, moved: false });
  const langViaDrag = useRef(false);
  const langDraggedRef = useRef(false);
  const langSnapTimer = useRef(0);
  const [langDragLeft, setLangDragLeft] = useState<number | null>(null);
  const [langDragTrans, setLangDragTrans] = useState<string | undefined>(undefined);
  const [langIsDragging, setLangIsDragging] = useState(false);
  const [langDragIntensity, setLangDragIntensity] = useState(0); // 0–1 how far dragged
  const [langDragVelocity, setLangDragVelocity] = useState(0); // for stretch effect
  const langDragPrevRef = useRef(0); // track previous delta for velocity
  const setLangDragPrev = useCallback((val: number) => { langDragPrevRef.current = val; }, []);
  const getLangDragPrev = useCallback(() => langDragPrevRef.current, []);

  // Track lang changes for liquid glass animation
  const langChangedRef = useRef(false);
  useEffect(() => {
    if (prevLang.current !== lang) {
      prevLang.current = lang;
      if (langViaDrag.current) {
        langViaDrag.current = false;
        return;
      }
      langChangedRef.current = true;
      const id = requestAnimationFrame(() => {
        setLangKey((k) => k + 1);
        langChangedRef.current = false;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [lang]);

  // Share — dropdown states
  const shareRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareContentVisible, setShareContentVisible] = useState(false);

  // Nav dropdown — metaball states
  const navDropdownAnimating = useRef(false);
  const navDropdownTimers = useRef<number[]>([]);
  const [navDropdownGoo, setNavDropdownGoo] = useState(false);
  const [navDropdownContentVisible, setNavDropdownContentVisible] = useState(false);

  const clearNavDropdownTimers = useCallback(() => {
    navDropdownTimers.current.forEach(clearTimeout);
    navDropdownTimers.current = [];
  }, []);

  const closeShare = useCallback(() => {
    setShareContentVisible(false);
    setTimeout(() => setShareOpen(false), 400);
    closePanel('share');
  }, [closePanel]);

  const handleToggleShare = useCallback(() => {
    if (shareOpen) {
      closeShare();
    } else {
      openPanel('share');
      setShareOpen(true);
      setShareContentVisible(true);
    }
  }, [shareOpen, closeShare, openPanel]);

  const closeNavDropdown = useCallback(() => {
    clearNavDropdownTimers();
    navDropdownAnimating.current = true;
    setNavDropdownGoo(true); // Re-enable goo so blobs merge during close
    setNavDropdownContentVisible(false);
    setMobileOpen(false);
    // Keep goo ON while blobs shrink, then snap off at the end
    navDropdownTimers.current.push(window.setTimeout(() => {
      setNavDropdownGoo(false);
      navDropdownAnimating.current = false;
    }, 950));
    closePanel('nav-dropdown');
  }, [clearNavDropdownTimers, closePanel]);

  const handleToggleMobile = useCallback(() => {
    clearNavDropdownTimers();
    if (mobileOpen) {
      closeNavDropdown();
    } else {
      openPanel('nav-dropdown');
      setMobileOpen(true);
      setNavDropdownGoo(true);
      navDropdownAnimating.current = true;
      setNavDropdownContentVisible(true);
      navDropdownTimers.current.push(window.setTimeout(() => {
        setNavDropdownGoo(false);
        navDropdownAnimating.current = false;
      }, 900));
    }
  }, [mobileOpen, openPanel, closeNavDropdown, clearNavDropdownTimers]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close share on click outside
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (shareRef.current && !shareRef.current.contains(target)) {
        closeShare();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen, closeShare]);

  // Close share on Escape
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShare();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shareOpen, closeShare]);

  // Close nav dropdown on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNavDropdown();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen, closeNavDropdown]);

  const prevActivePanel = useRef(activePanel);

  // Close nav dropdown / share when another panel opens
  useEffect(() => {
    if (prevActivePanel.current !== activePanel) {
      prevActivePanel.current = activePanel;
      const frame = requestAnimationFrame(() => {
        if (activePanel && activePanel !== 'nav-dropdown' && mobileOpen && !navDropdownAnimating.current) {
          closeNavDropdown();
        }
        if (activePanel && activePanel !== 'share' && shareOpen) {
          closeShare();
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [activePanel, mobileOpen, shareOpen, closeShare, closeNavDropdown, navDropdownAnimating]);

  // Language toggle drag handlers
  const handleLangPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = langToggleRef.current;
    if (!el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    window.clearTimeout(langSnapTimer.current);
    const d = langDragRef.current;
    d.active = true;
    d.startX = e.clientX;
    d.baseLang = lang;
    d.offset = 0;
    d.moved = false;
    const half = el.offsetWidth / 2;
    const baseLeft = lang === 'id' ? 2 : half;
    setLangDragLeft(baseLeft);
    setLangDragTrans('none');
    setLangIsDragging(true);
    setLangDragIntensity(0);
    setLangDragVelocity(0);
    setLangDragPrev(0);
  }, [lang, setLangDragPrev]);

  const handleLangPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = langDragRef.current;
    if (!d.active) return;
    const el = langToggleRef.current;
    if (!el) return;
    const deltaX = e.clientX - d.startX;
    if (Math.abs(deltaX) > 3) d.moved = true;
    const w = el.offsetWidth;
    const half = w / 2;
    const pad = 2;
    const indicatorWidth = half - pad;
    const baseLeft = d.baseLang === 'id' ? pad : half;
    const travel = half - pad;

    // Hard clamp: indicator must stay within toggle blue bounds
    const minLeft = pad;
    const maxLeft = w - pad - indicatorWidth;
    let targetLeft = baseLeft + deltaX;

    // Strict clamp — no overshoot beyond bounds
    if (targetLeft < minLeft) targetLeft = minLeft;
    else if (targetLeft > maxLeft) targetLeft = maxLeft;

    d.offset = targetLeft - baseLeft;
    setLangDragLeft(targetLeft);

    // Calculate intensity (0→1, clamped)
    const rawIntensity = Math.abs(d.offset) / travel;
    setLangDragIntensity(Math.min(1, rawIntensity));

    // Calculate velocity (current - previous offset)
    const velocity = d.offset - getLangDragPrev();
    setLangDragPrev(d.offset);
    setLangDragVelocity(velocity);
  }, [getLangDragPrev, setLangDragPrev]);

  const handleLangPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = langDragRef.current;
    if (!d.active) return;
    d.active = false;
    setLangIsDragging(false);
    setLangDragIntensity(0);
    setLangDragVelocity(0);
    const el = langToggleRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const half = w / 2;
    const pad = 2;
    const travel = half - pad;
    const threshold = travel * 0.25;

    if (!d.moved) {
      // Tap — determine which half
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const tappedLang: 'id' | 'en' = relX < half ? 'id' : 'en';
      if (tappedLang !== lang) setLang(tappedLang);
      setLangDragLeft(null);
      setLangDragTrans(undefined);
      return;
    }

    // Prevent button onClick after drag
    langDraggedRef.current = true;
    window.setTimeout(() => { langDraggedRef.current = false; }, 300);

    const shouldSwitch = Math.abs(d.offset) > threshold;
    if (shouldSwitch) {
      const newLang: 'id' | 'en' = d.baseLang === 'id' ? 'en' : 'id';
      const targetLeft = newLang === 'id' ? pad : half;
      setLangDragLeft(targetLeft);
      setLangDragTrans('left 0.3s cubic-bezier(0.22, 1, 0.36, 1)');
      langSnapTimer.current = window.setTimeout(() => {
        langViaDrag.current = true;
        setLang(newLang);
        setLangDragLeft(null);
        setLangDragTrans(undefined);
      }, 300);
    } else {
      // Snap back with spring
      const baseLeft = d.baseLang === 'id' ? pad : half;
      setLangDragLeft(baseLeft);
      setLangDragTrans('left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)');
      langSnapTimer.current = window.setTimeout(() => {
        setLangDragLeft(null);
        setLangDragTrans(undefined);
      }, 500);
    }
  }, [lang, setLang]);

  // Cleanup snap timer on unmount
  useEffect(() => {
    return () => { window.clearTimeout(langSnapTimer.current); };
  }, []);

  const handleNavClick = () => { closeNavDropdown(); };

  const handleCauseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCausePopup(true);
    closeNavDropdown();
  };

  const handleCauseConfirm = () => {
    setShowCausePopup(false);
  };

  const handleCopyLink = useCallback(async () => {
    const shareText = `${t('share_msg')}\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    showToast(t('toast_link_copied'));
    setTimeout(() => setCopied(false), 2000);
  }, [t, showToast]);

  const handleShareWhatsApp = useCallback(() => {
    const shareText = encodeURIComponent(`${t('share_msg')}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${shareText}`, '_blank', 'noopener');
  }, [t]);

  return (
    <>
    {/* SVG Goo/Metaball Filters */}
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter id="goo-nav">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="in" />
        </filter>
      </defs>
    </svg>
    <nav
      className={`nb fixed top-0 left-0 right-0 z-50 border-b border-ocean-100/50 dark:border-white/10 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-ocean-900/8' : ''
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group mr-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-ocean-900 dark:text-white">Water Savers</span>
              <span className="text-[10px] text-ocean-500 dark:text-cyan-400 font-semibold tracking-wider uppercase">Team</span>
            </div>
          </a>

          {/* Right side: theme + share | language + hamburger */}
          <div className="flex items-center ml-auto md:mr-2">
            <div className="flex items-center ml-1 mr-1">
              <ThemeToggle />

              {/* Share — Dropdown Panel */}
              <div ref={shareRef} className="relative">
                {/* Trigger button */}
                <button
                  className={`relative z-10 share-btn-3d flex items-center justify-center w-[44px] h-[44px] rounded-full cursor-pointer ${
                    shareOpen ? 'share-btn-3d-active' : ''
                  }`}
                  onClick={handleToggleShare}
                  aria-label={t('share_btn_label')}
                  aria-expanded={shareOpen}
                >
                  <Share2
                    className="h-6 w-6 absolute transition-all duration-500 ease-[cubic-bezier(0.28,0.11,0.32,1)]"
                    style={{ opacity: shareOpen ? 0 : 1, transform: shareOpen ? 'scale(0.4) rotate(90deg)' : 'scale(1) rotate(0deg)' }}
                  />
                  <X
                    className="h-6 w-6 absolute transition-all duration-500 ease-[cubic-bezier(0.28,0.11,0.32,1)]"
                    style={{ opacity: shareOpen ? 1 : 0, transform: shareOpen ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-90deg)' }}
                  />
                </button>

                {/* Dropdown panel content */}
                <div className={`share-dropdown-panel glass-panel prismatic-border prismatic-caustic ${shareContentVisible ? 'visible' : ''}`}>
                  <button
                    onClick={() => { handleCopyLink(); closeShare(); }}
                    className="share-dropdown-item"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ocean-100 dark:bg-white/10 shrink-0">
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-ocean-600 dark:text-cyan-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-[13px] font-medium">{t('share_copy')}</span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{t('share_btn_label')}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { handleShareWhatsApp(); closeShare(); }}
                    className="share-dropdown-item"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 shrink-0">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald-600 dark:fill-emerald-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[13px] font-medium">{t('share_wa')}</span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{t('share_btn_label')}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={langToggleRef}
              className={`relative flex items-center rounded-full bg-ocean-100/80 dark:bg-white/10 p-1 ring-1 ring-ocean-200/60 dark:ring-white/10 lang-toggle-liquid ${langIsDragging ? 'lang-dragging' : ''}`}
              role="radiogroup"
              aria-label="Language"
              style={{ touchAction: 'pan-y', userSelect: langIsDragging ? 'none' : undefined }}
              onPointerDown={handleLangPointerDown}
              onPointerMove={handleLangPointerMove}
              onPointerUp={handleLangPointerUp}
            >
              {/* Liquid glass sliding indicator */}
              <div
                key={langKey}
                className="absolute top-1 bottom-1 rounded-full lang-liquid-indicator"
                style={{
                  left: langDragLeft !== null ? `${langDragLeft}px` : (lang === 'id' ? '2px' : 'calc(50% + 0px)'),
                  width: 'calc(50% - 2px)',
                  transition: langDragTrans,
                  ...(langIsDragging ? {
                    // Liquid glass drag: organic deformation based on velocity + intensity
                    transform: `scaleX(${1 + Math.abs(langDragVelocity) * 0.008}) scaleY(${1 - Math.abs(langDragVelocity) * 0.004}) skewX(${langDragVelocity * 0.3}deg)`,
                    borderRadius: `${48 + langDragIntensity * 4}% ${52 + langDragIntensity * 3}% ${50 + langDragVelocity * 0.5}% ${50 - langDragVelocity * 0.5}%`,
                    backdropFilter: `blur(${16 + langDragIntensity * 12}px) saturate(${180 + langDragIntensity * 120}%) brightness(${1.08 + langDragIntensity * 0.12})`,
                    WebkitBackdropFilter: `blur(${16 + langDragIntensity * 12}px) saturate(${180 + langDragIntensity * 120}%) brightness(${1.08 + langDragIntensity * 0.12})`,
                    boxShadow: `
                      0 ${2 + langDragIntensity * 4}px ${6 + langDragIntensity * 10}px rgba(0,0,0,${0.06 + langDragIntensity * 0.06}),
                      0 0 ${langDragIntensity * 20}px rgba(100,180,255,${langDragIntensity * 0.15}),
                      inset 0 1px 0 rgba(255,255,255,${0.8 + langDragIntensity * 0.2}),
                      inset 0 -0.5px 0 rgba(0,0,0,${0.03 + langDragIntensity * 0.04})
                    `,
                  } : {}),
                }}
              />
              {/* Liquid glass caustic layer — appears during drag */}
              <div
                className="absolute top-1 bottom-1 rounded-full pointer-events-none lang-liquid-caustic"
                style={{
                  left: langDragLeft !== null ? `${langDragLeft}px` : (lang === 'id' ? '2px' : 'calc(50% + 0px)'),
                  width: 'calc(50% - 2px)',
                  transition: langDragTrans,
                  opacity: langIsDragging ? langDragIntensity : 0,
                  background: `radial-gradient(ellipse at ${50 + langDragVelocity * 2}% 30%, rgba(255,255,255,${0.3 + langDragIntensity * 0.3}), transparent 70%)`,
                }}
              />
              {/* Light refraction layer */}
              <div
                key={`refract-${langKey}`}
                className="absolute top-1 bottom-1 rounded-full lang-liquid-refraction pointer-events-none"
                style={{
                  left: langDragLeft !== null ? `${langDragLeft}px` : (lang === 'id' ? '2px' : 'calc(50% + 0px)'),
                  width: 'calc(50% - 2px)',
                  transition: langDragTrans,
                }}
              />
              <button
                onClick={() => { if (langDraggedRef.current) return; setLang('id'); }}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 cursor-pointer lang-toggle-btn ${
                  lang === 'id'
                    ? 'text-ocean-700 dark:text-cyan-300 lang-toggle-btn-active'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                aria-label="Bahasa Indonesia"
                aria-pressed={lang === 'id'}
              >
                ID
              </button>
              <button
                onClick={() => { if (langDraggedRef.current) return; setLang('en'); }}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 cursor-pointer lang-toggle-btn ${
                  lang === 'en'
                    ? 'text-ocean-700 dark:text-cyan-300 lang-toggle-btn-active'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                aria-label="English"
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {/* Hamburger — Metaball System */}
            <div
              className={`relative ml-1 ${mobileOpen ? 'nav-dropdown-active' : ''} ${navDropdownGoo ? 'nav-dropdown-goo-active' : ''}`}
            >
              {/* Goo metaball visual layer — button blob */}
              <div className="nav-dropdown-goo-container">
                <div className="nav-dropdown-btn-blob" />
              </div>

              {/* Hamburger trigger button */}
              <button
                className={`relative z-10 hamburger-btn ${mobileOpen ? 'active' : ''}`}
                onClick={handleToggleMobile}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <span className="hamburger-bar bar-top" />
                <span className="hamburger-bar bar-mid" />
                <span className="hamburger-bar bar-bot" />
              </button>
            </div>
          </div>
        </div>
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
              onClick={handleCauseConfirm}
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
    </nav>

    {/* Nav dropdown — frosted glass panel, fixed below nav bar */}
    <div className="fixed top-[4.5rem] left-0 right-0 z-40">
      {/* Panel content */}
      <div className={`nav-dropdown-goo-panel glass-panel prismatic-border prismatic-caustic ${navDropdownContentVisible ? 'visible' : ''}`}>
        <div className="px-3 pb-0 pt-0 space-y-0">
          {NAV_LINKS.map((link, i) => (
            link.href === '#penyebab' ? (
              <button
                key={link.href}
                onClick={(e) => { handleCauseClick(e); }}
                className="mobile-nav-item flex items-center justify-center w-full rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/8 transition-colors cursor-pointer"
                style={{ transitionDelay: navDropdownContentVisible ? `${i * 0.06}s` : '0s', height: '42px' }}
              >
                {t(link.labelKey)}
              </button>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={() => { handleNavClick(); }}
                className="mobile-nav-item flex items-center justify-center w-full rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/8 transition-colors"
                style={{ transitionDelay: navDropdownContentVisible ? `${i * 0.06}s` : '0s', height: '42px' }}
              >
                {t(link.labelKey)}
              </a>
            )
          ))}
        </div>
      </div>
    </div>
    </>
  );
}