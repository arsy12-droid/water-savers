'use client';

import React, { memo } from 'react';
import { Droplets, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { XLogo } from './x-logo';
import { useToast } from '@/hooks/use-animations';

const NAV_LINKS = [
  { href: '#penyebab', labelKey: 'nav_cause_m' },
  { href: '#data', labelKey: 'nav_data_m' },
  { href: '#peta', labelKey: 'nav_map_m' },
  { href: '#langkah', labelKey: 'nav_steps_m' },
  { href: '#dampak', labelKey: 'nav_impact_m' },
];

const DATA_SOURCES = [
  { id: 'Badan Pusat Statistik (BPS)', en: 'Statistics Indonesia (BPS)' },
  { id: 'KLHK Indonesia', en: 'KLHK Indonesia' },
  { id: 'World Health Organization (WHO)', en: 'World Health Organization (WHO)' },
  { id: 'World Resources Institute (WRI)', en: 'World Resources Institute (WRI)' },
  { id: 'US Environmental Protection Agency (EPA)', en: 'US Environmental Protection Agency (EPA)' },
  { id: 'Water Footprint Network', en: 'Water Footprint Network' },
  { id: 'BMKG Indonesia', en: 'BMKG Indonesia' },
  { id: 'Kementerian PUPR', en: 'Ministry of Public Works (PUPR)' },
  { id: 'Kementerian Pertanian', en: 'Ministry of Agriculture' },
  { id: 'Kementerian Kesehatan RI', en: 'Ministry of Health RI' },
];

function Footer() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const handleSocialClick = (platform: string) => {
    showToast(`${platform} ${t('toast_coming_soon')}`);
  };

  return (
    <footer className="bg-ocean-950 dark:bg-gray-950 pt-0 pb-8 relative">
      {/* Animated gradient line at very top */}
      <div className="footer-gradient-line" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-sm">{t('ft_brand')}</span>
                <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">{t('ft_slogan')}</span>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-5">{t('ft_desc')}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => handleSocialClick('Instagram')} className="social-icon-hover w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer" aria-label="Instagram">
                <Instagram className="w-4 h-4 text-white/50" />
              </button>
              <button onClick={() => handleSocialClick('YouTube')} className="social-icon-hover w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer" aria-label="YouTube">
                <Youtube className="w-4 h-4 text-white/50" />
              </button>
              <button onClick={() => handleSocialClick('X')} className="social-icon-hover w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer" aria-label="X">
                <XLogo className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-5">{t('ft_nav_title')}</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link-hover text-white/40 text-xs">
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Data sources */}
          <div>
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-5">{t('ft_src_title')}</h4>
            <ul className="space-y-2">
              {DATA_SOURCES.map((src) => (
                <li key={src.id} className="footer-src-hover text-white/40 text-xs leading-relaxed">{lang === 'id' ? src.id : src.en}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">{t('ft_copy')}</p>
          <p className="text-white/25 text-xs flex items-center gap-1.5">
            Every drop matters for our future{' '}
            <Droplets className="w-3 h-3 text-blue-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
