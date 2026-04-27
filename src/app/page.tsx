'use client';

import { LanguageProvider, useLanguage } from '@/hooks/use-language';
import { useScrollAnimation } from '@/hooks/use-animations';
import dynamic from 'next/dynamic';
import Navbar from '@/components/water-savers/navbar';
import Hero from '@/components/water-savers/hero';
import Causes from '@/components/water-savers/causes';
import DataSection from '@/components/water-savers/data-section';
import Steps from '@/components/water-savers/steps';

import Footer from '@/components/water-savers/footer';
import BackToTop from '@/components/water-savers/back-to-top';

const WaterCrisisMapLazy = dynamic(
  () => import('@/components/water-savers/water-crisis-map'),
  {
    ssr: false,
    loading: () => (
      <section id="peta" className="relative py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
          </div>
          <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </section>
    ),
  }
);

// Lazy-load below-fold sections for faster initial paint
const ImpactLazy = dynamic(() => import('@/components/water-savers/impact'), { ssr: true });
const CTALazy = dynamic(() => import('@/components/water-savers/cta'), { ssr: true });
const CalculatorLazy = dynamic(
  () => import('@/components/water-savers/water-footprint-calculator'),
  {
    ssr: false,
    loading: () => <div id="kalkulator" />,
  }
);

// Dynamic import for ChatAssistant — loads ReactMarkdown, remarkGfm lazily (reduces initial JS by ~40KB)
const ChatAssistant = dynamic(
  () => import('@/components/water-savers/chat-assistant'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-ocean-600 shadow-lg shadow-cyan-500/30 animate-pulse" aria-hidden="true" />
    ),
  }
);

function AppContent() {
  useScrollAnimation();
  const { lang } = useLanguage();

  return (
    <div className="bg-ocean-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 overflow-x-hidden min-h-screen flex flex-col transition-colors duration-300">
      {/* Skip to content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-ocean-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        {lang === 'en' ? 'Skip to main content' : 'Langsung ke konten utama'}
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <Causes />
        <DataSection />
        <WaterCrisisMapLazy />
        <Steps />
        <div id="kalkulator"><CalculatorLazy /></div>
        <ImpactLazy />
        <CTALazy />
      </main>
      <Footer />
      <BackToTop />
      <ChatAssistant />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
