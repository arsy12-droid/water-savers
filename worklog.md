# Water Savers Team — Worklog

## 2025-04-21 — Page Files & API Routes

**Task**: Write page files and API route files from zip extraction source.

### Files Written

**Page files:**
- `src/app/page.tsx` — Main homepage with LanguageProvider, lazy-loaded sections (Impact, CTA, ChatAssistant), accessibility skip-to-content link
- `src/app/layout.tsx` — Root layout with Inter font, ThemeProvider, full SEO metadata (OpenGraph, Twitter, JSON-LD structured data for Organization + WebSite)
- `src/app/error.tsx` — Bilingual error boundary (id/en) with `useSyncExternalStore` for language detection
- `src/app/not-found.tsx` — Bilingual 404 page with language-aware text
- `src/app/icon.tsx` — Dynamic favicon using `next/og` ImageResponse with gradient + droplet emoji

**API routes:**
- `src/app/api/chat/route.ts` — Main chat API (POST for messages with streaming/non-streaming, PUT for feedback, DELETE for session clearing). Includes: ZAI singleton, conversation store with per-session locking + LRU eviction, content moderation (HTML injection + URL blocking), knowledge base search, web search integration, Zod validation, rate limiting, CSRF protection
- `src/app/api/chat/knowledge/route.ts` — GET endpoint returning knowledge base entry count
- `src/app/api/chat/knowledge/seed/route.ts` — POST endpoint to seed knowledge base with 16 initial Q&A pairs (id/en) covering water conservation, ocean science, Indonesia water crisis, El Niño, pollution, rainwater harvesting, coral reefs
- `src/app/api/chat/vision/route.ts` — POST endpoint for image analysis via VLM. 11-layer validation pipeline (CSRF, rate limit, FormData, extension, size, min size, magic bytes, MIME, sharp processing). Uses sharp for EXIF stripping and resize

**Config:**
- `next.config.ts` — Standalone output, security headers (CSP, HSTS, X-Frame-Options, etc.), optimized image/device sizes, `optimizePackageImports`, `allowedDevOrigins: []`

### Modification
- `next.config.ts`: Changed `allowedDevOrigins` from preview URL to empty array `[]`
