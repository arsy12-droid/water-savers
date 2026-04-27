'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useScrollAnimation() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add('visible');

            // Trigger bar-fill and bar-fill-enhanced animations for children
            el.querySelectorAll('.bar-fill, .bar-fill-enhanced').forEach((b, i) => {
              setTimeout(() => b.classList.add('visible'), i * 120);
            });
            el.querySelectorAll('.num-reveal').forEach((n, i) => {
              setTimeout(() => n.classList.add('visible'), i * 100);
            });

            // Unobserve after becoming visible — no need to re-observe
            observerRef.current?.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    const selector = '.anim, .anim-left, .anim-right, .anim-scale, .anim-blur';

    function observeAll() {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains('visible')) {
          observerRef.current?.observe(el);
        }
      });
    }

    // Observe existing elements
    observeAll();

    // Watch for dynamically added elements (debounced to avoid perf issues during streaming)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        observeAll();
      }, 200);
    });

    // Scope observer to #main-content to avoid overhead during chat streaming
    const mainContent = document.getElementById('main-content') || document.body;
    mutationObserver.observe(mainContent, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

export function useToast() {
  const showToast = useCallback((msg: string) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.classList.add('fade-out');
      setTimeout(() => t.remove(), 300);
    }, 2000);
  }, []);

  return { showToast };
}

// useConfetti removed — was defined but never used anywhere
