import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { securityGuard, getClientIp } from '@/lib/security';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { SYSTEM_PROMPT_ID, SYSTEM_PROMPT_EN, getRealtimeContext } from '@/lib/prompts';

// ── Zod Validation Schemas ─────────────────────────────────────────────

const chatPostSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().max(100).regex(/^[a-zA-Z0-9\-_]+$/).optional().default('default'),
  lang: z.enum(['id', 'en']).optional().default('id'),
});

const feedbackPutSchema = z.object({
  sessionId: z.string().max(100).regex(/^[a-zA-Z0-9\-_]+$/),
  question: z.string().min(1).max(5000),
  answer: z.string().min(1).max(5000),
  feedback: z.union([z.literal(1), z.literal(-1), z.literal(0)]), // 0 = remove/un-toggle
  lang: z.enum(['id', 'en']).optional().default('id'),
  token: z.string().optional(),
});

const chatDeleteSchema = z.object({
  sessionId: z.string().max(100).regex(/^[a-zA-Z0-9\-_]+$/).optional().default('default'),
  token: z.string().min(1),
});

// ── Conversation Store with per-session locking (Bug #9) ─────────────────

interface ConversationHistory extends Array<{ role: string; content: string }> {
  lastAccess: number;
  token: string;
}

const conversations = new Map<string, ConversationHistory>();
const CONVERSATION_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CONVERSATIONS = 500;
const MAX_MESSAGES = 30;

// Per-session lock using promise queue (prevents TOCTOU race)
const sessionQueues = new Map<string, Promise<void>>();

async function acquireLock(sessionId: string): Promise<() => void> {
  const prev = sessionQueues.get(sessionId) ?? Promise.resolve();
  let releaseLock!: () => void;
  const current = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  sessionQueues.set(sessionId, current);
  await prev;
  return () => {
    releaseLock();
  };
}

// Bug #21: LRU eviction — find least recently accessed conversation
function evictLRU() {
  let oldestKey: string | null = null;
  let oldestAccess = Infinity;
  for (const [key, val] of conversations) {
    if (val.lastAccess < oldestAccess) {
      oldestAccess = val.lastAccess;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    conversations.delete(oldestKey);
    sessionQueues.delete(oldestKey);
  }
}

// Periodically clean up stale conversations and session queues (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of conversations) {
    if (now - val.lastAccess > CONVERSATION_TTL) {
      conversations.delete(key);
      sessionQueues.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Generate a random session token for ownership verification
function generateSessionToken(): string {
  return randomBytes(16).toString('hex');
}

// ── Content Moderation (Bug #14: strengthened) ──────────────────────────

// Content Moderation — HTML patterns checked on original content, URL patterns on normalized
const BLOCKED_HTML_PATTERNS = [
  /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
  /<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi,
  /<\s*object[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi,
  /<\s*embed[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi,
  /<\s*link[^>]*>[\s\S]*?>/gi,
  /<\s*meta[^>]*>[\s\S]*?>/gi,
  /<\s*img[^>]*on\w+\s*=/gi,
  /on\w+\s*=\s*["'][^"']*\s*javascript/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
];

const BLOCKED_URL_PATTERNS = [
  /(?:http|https):\/\/[^\s]+/gi,
  /\b(?:www\.|bit\.ly|t\.co|tinyurl)\.\S+/gi,
];

// Normalization: strip ALL non-alphanumeric chars around URLs for detection
function normalizeContent(content: string): string {
  return content
    .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Zero-width characters
    .replace(/[^a-z0-9\s/:.]/gi, '')          // Strip non-alphanumeric (keeps URL chars)
    .replace(/\s+/g, '')                       // Remove ALL whitespace
    .toLowerCase();
}

function isContentSafe(content: string): boolean {
  if (!content || content.length > 5000) return false;
  // Check original content for HTML/injection patterns
  const hasHtmlOrInjection = BLOCKED_HTML_PATTERNS.some(pattern => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  });
  if (hasHtmlOrInjection) return false;
  // Check normalized content for URL patterns (harder to obfuscate check)
  const normalized = normalizeContent(content);
  return !BLOCKED_URL_PATTERNS.some(pattern => {
    pattern.lastIndex = 0;
    return pattern.test(normalized);
  });
}

// ── ZAI Singleton (Bug #20 — already fixed) ────────────────────────────

let zaiPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null;

async function getZAI() {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

// ── Search triggers (Bug #22: exported for client sync) ────────────────

export const SEARCH_TRIGGERS = [
  // Indonesian
  'hari ini', 'sekarang', 'terbaru', 'terkini', 'tahun ini', 'bulan ini',
  'tahun 2024', 'tahun 2025', 'berita', 'kabar', 'update', 'cuaca', 'prakiraan',
  'banjir', 'kekeringan', 'el nino', 'la nina', 'krisis air', 'wabah', 'musim',
  'kemarin', 'besok', 'minggu ini',
  // English
  'latest', 'current', 'recent', 'news', 'today', 'now', 'this year',
  '2024', '2025', 'forecast', 'weather', 'flood', 'drought', 'happening',
];

function shouldSearch(query: string): boolean {
  const lower = query.toLowerCase();
  return SEARCH_TRIGGERS.some((trigger) => lower.includes(trigger));
}

// Web search with z-ai-web-dev-sdk
async function webSearch(query: string, lang: string): Promise<string> {
  try {
    const zai = await getZAI();
    const searchQuery = lang === 'id'
      ? `${query} Indonesia terbaru 2025`
      : `${query} latest 2025`;

    const results = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 5,
    });

    if (!results || !Array.isArray(results) || results.length === 0) {
      return '';
    }

    const topResults = results.slice(0, 5);
    const label = lang === 'id'
      ? '[HASIL PENCARIAN WEB REAL-TIME — Gunakan info ini sebagai sumber terkini]'
      : '[REAL-TIME WEB SEARCH RESULTS — Use this as current source info]';

    const searchContext = topResults
      .map((r: any, i: number) => {
        const source = lang === 'id' ? 'Sumber' : 'Source';
        return `${i + 1}. ${r.name || 'Untitled'}\n   ${r.snippet || 'No description'}\n   ${source}: ${r.url || 'N/A'}`;
      })
      .join('\n\n');

    const instruction = lang === 'id'
      ? `Pertanyaan user: "${query}"\n\n${searchContext}\n\nIngat: Gunakan info di atas untuk menjawab pertanyaan user secara akurat. Sebutkan sumbernya secara natural dalam jawaban kamu.`
      : `User question: "${query}"\n\n${searchContext}\n\nRemember: Use the info above to answer the user's question accurately. Mention sources naturally in your answer.`;

    return `\n\n${label}\n\n${instruction}`;
  } catch (error) {
    console.error('Web search failed:', error);
    return '';
  }
}

// ── Knowledge Base Search (Bug #11: optimized) ─────────────────────────

async function findRelevantKnowledge(question: string, lang: string): Promise<string[]> {
  try {
    const keywords = question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (keywords.length === 0) return [];

    // Bug #11: Use top keywords for WHERE clause to limit DB scan
    const topKeywords = keywords.slice(0, 3);
    const whereConditions = topKeywords.map(kw => ({
      question: { contains: kw },
    }));

    const allKnowledge = await db.chatKnowledge.findMany({
      where: {
        lang,
        OR: whereConditions,
      },
      orderBy: { upvotes: 'desc' },
      take: 20, // Reduced from 50
    });

    if (allKnowledge.length === 0) return [];

    const scored = allKnowledge.map((k) => {
      const qWords = k.question.toLowerCase().split(/\s+/);
      const matchCount = keywords.filter((kw) => qWords.some((qw) => qw.includes(kw) || kw.includes(qw))).length;
      const score = matchCount / Math.max(keywords.length, qWords.length);
      return { ...k, score };
    });

    const relevant = scored.filter((s) => s.score >= 0.2).slice(0, 5);

    const userLabel = lang === 'id' ? 'Pengguna' : 'User';
    const answerLabel = lang === 'id' ? 'Jawaban yang sudah disetujui user' : 'Previously approved answer';

    return relevant.map(
      (r) =>
        `Previous conversation:\n${userLabel}: "${r.question}"\n${answerLabel}: "${r.answer}"`
    );
  } catch {
    return [];
  }
}

// Save a Q&A pair to knowledge base when user gives positive feedback
async function learnFromConversation(question: string, answer: string, lang: string) {
  try {
    if (!isContentSafe(question) || !isContentSafe(answer)) {
      console.warn('Knowledge base write blocked: content failed safety check');
      return;
    }

    const existing = await db.chatKnowledge.findUnique({
      where: { question_lang: { question, lang } },
    });

    if (existing) {
      await db.chatKnowledge.update({
        where: { id: existing.id },
        data: { upvotes: { increment: 1 }, answer, updatedAt: new Date() },
      });
    } else {
      await db.chatKnowledge.create({
        data: { question, answer, lang, source: 'auto', upvotes: 1 },
      });
    }
  } catch (error) {
    console.error('Failed to save knowledge:', error);
  }
}

// ── POST: Chat message ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const isStreaming = request.nextUrl.searchParams.get('stream') === 'true';

  try {
    const guard = securityGuard(request);
    if (guard) return guard;

    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`chat:${clientIp}`, RATE_LIMITS.chat);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    const parsed = chatPostSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { message, sessionId, lang } = parsed.data;

    if (!isContentSafe(message)) {
      return NextResponse.json(
        { success: false, error: 'Message contains disallowed content' },
        { status: 400 }
      );
    }

    const zai = await getZAI();
    const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;

    let searched = false;
    let searchContext = '';

    if (shouldSearch(message)) {
      searched = true;
      searchContext = await webSearch(message, lang);
    }

    const relevantKnowledge = await findRelevantKnowledge(message, lang);

    let enhancedSystemPrompt = systemPrompt + getRealtimeContext(lang);

    if (searchContext) {
      enhancedSystemPrompt += searchContext;
    }

    if (relevantKnowledge.length > 0) {
      const label = lang === 'id'
        ? '[REFLEKSI Percakapan Nyata — Pelajaran dari User Sebelumnya]\nKamu sudah pernah ngobrol soal serupa dengan user lain, dan ini jawaban yang mereka setujui. Gunakan ini sebagai referensi untuk jawab lebih baik:'
        : '[REFLECTION FROM REAL CONVERSATIONS — Lessons from Previous Users]\nYou have chatted about similar topics with other users, and these are answers they approved. Use this as reference to answer better:';

      enhancedSystemPrompt += `\n\n${label}\n\n${relevantKnowledge.join('\n\n')}`;
    }

    // Bug #9: Acquire per-session lock
    const releaseLock = await acquireLock(sessionId);

    try {
      let stored = conversations.get(sessionId);
      let history: { role: string; content: string }[];

      if (stored) {
        stored.lastAccess = Date.now();
        history = stored;
      } else {
        if (conversations.size >= MAX_CONVERSATIONS) {
          evictLRU(); // Bug #21: LRU eviction
        }
        history = [
          { role: 'system', content: enhancedSystemPrompt },
        ] as ConversationHistory;
        (history as ConversationHistory).lastAccess = Date.now();
        (history as ConversationHistory).token = generateSessionToken();
        conversations.set(sessionId, history as ConversationHistory);
      }

      if (history.length > 0 && history[0].role === 'system') {
        history[0] = { role: 'system', content: enhancedSystemPrompt };
      }

      history.push({ role: 'user', content: message });

      if (history.length > MAX_MESSAGES) {
        const sessionToken = (history as ConversationHistory).token;
        history = [
          history[0],
          ...history.slice(-(MAX_MESSAGES - 1)),
        ];
        (history as ConversationHistory).token = sessionToken;
      }

      // ── Streaming path ──────────────────────────────────────────
      if (isStreaming) {
        const sessionToken = (history as ConversationHistory).token || '';
        const fallbackResponse = lang === 'id'
          ? 'Hmm, aku lagi ngalamin gangguan teknis nih 😅 Coba tanya lagi ya!'
          : 'Hmm, having some technical issues right now 😅 Try asking again!';

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            let aborted = false;

            function sendEvent(event: string, data: Record<string, unknown>) {
              if (aborted) return;
              try {
                controller.enqueue(
                  encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
                );
              } catch {
                aborted = true;
              }
            }

            sendEvent('meta', { token: sessionToken, searched, sessionId });

            let sdkStream: ReadableStream<Uint8Array> | null = null;
            let streamReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
            let fullContent = '';

            try {
              sdkStream = await zai.chat.completions.create({
                messages: history as any,
                stream: true,
                temperature: 0.4,
                thinking: { type: 'disabled' },
              }) as ReadableStream<Uint8Array>;

              if (!sdkStream || typeof sdkStream.getReader !== 'function') {
                sendEvent('chunk', { content: fallbackResponse });
                fullContent = fallbackResponse;
              } else {
                const reader = sdkStream.getReader();
                streamReader = reader;
                let buffer = '';

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });

                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const data = trimmed.slice(6);
                    if (data.trim() === '[DONE]') continue;

                    try {
                      const parsed = JSON.parse(data);
                      const content: string | undefined = parsed.choices?.[0]?.delta?.content;
                      if (content) {
                        fullContent += content;
                        sendEvent('chunk', { content });
                      }
                    } catch {
                      // Ignore malformed JSON chunks
                    }
                  }
                }
              }
            } catch (streamError) {
              console.error('Streaming error:', streamError);
              if (!fullContent && !aborted) {
                fullContent = fallbackResponse;
                sendEvent('chunk', { content: fallbackResponse });
              }
            } finally {
              try { streamReader?.releaseLock(); } catch { /* ignore */ }
            }

            if (aborted) return;

            // Save to DB BEFORE closing stream to ensure durability
            const finalResponse = fullContent || fallbackResponse;

            history.push({ role: 'assistant', content: finalResponse });
            (history as ConversationHistory).lastAccess = Date.now();
            conversations.set(sessionId, history as ConversationHistory);

            // Await DB save before closing to prevent data loss
            await db.chatMessage.createMany({
              data: [
                { sessionId, role: 'user', content: message, lang },
                { sessionId, role: 'assistant', content: finalResponse, lang },
              ],
            }).catch((dbError: Error) => {
              console.error('Failed to store messages after streaming:', dbError);
            });

            sendEvent('done', { content: '' });
            controller.close();
          },
          cancel() {
            // Resources cleaned up in finally block + aborted flag
          },
        });

        releaseLock(); // Release lock before sending response
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      // ── Non-streaming path ────────────────────────────────────────
      const completion = await zai.chat.completions.create({
        messages: history as any,
        temperature: 0.4,
        thinking: { type: 'disabled' },
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        (lang === 'id'
          ? 'Hmm, aku lagi ngalamin gangguan teknis nih 😅 Coba tanya lagi ya!'
          : 'Hmm, having some technical issues right now 😅 Try asking again!');

      history.push({ role: 'assistant', content: aiResponse });
      (history as ConversationHistory).lastAccess = Date.now();
      conversations.set(sessionId, history as ConversationHistory);

      // Bug #12: Save to DB before returning response
      await db.chatMessage.createMany({
        data: [
          { sessionId, role: 'user', content: message, lang },
          { sessionId, role: 'assistant', content: aiResponse, lang },
        ],
      }).catch((dbError) => {
        console.error('Failed to store messages:', dbError);
      });

      releaseLock(); // Release lock before returning

      return NextResponse.json({
        success: true,
        message: aiResponse,
        token: (history as ConversationHistory).token,
        searched,
      });
    } catch (lockError) {
      releaseLock();
      throw lockError;
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── PUT: Feedback ────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const guard = securityGuard(request);
    if (guard) return guard;

    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`feedback:${clientIp}`, RATE_LIMITS.feedback);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many feedback requests. Please wait.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = feedbackPutSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];
      return NextResponse.json({ error: firstError?.message || 'Invalid request' }, { status: 400 });
    }

    const { sessionId, question, answer, feedback, lang, token } = parsed.data;

    if (token) {
      const stored = conversations.get(sessionId);
      if (stored) {
        const storedToken = (stored as ConversationHistory).token;
        if (storedToken && storedToken !== token) {
          return NextResponse.json(
            { error: 'Unauthorized — invalid session token' },
            { status: 403 }
          );
        }
      }
    }

    if (feedback === 0) {
      const matchingMsg = await db.chatMessage.findFirst({
        where: { sessionId, role: 'assistant', content: answer, lang },
        orderBy: { createdAt: 'desc' },
      });
      if (matchingMsg) {
        await db.chatMessage.update({
          where: { id: matchingMsg.id },
          data: { feedback: null },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (feedback === 1 && (!isContentSafe(question) || !isContentSafe(answer))) {
      return NextResponse.json({ error: 'Content failed safety check' }, { status: 400 });
    }

    const matchingMsg = await db.chatMessage.findFirst({
      where: { sessionId, role: 'assistant', content: answer, lang },
      orderBy: { createdAt: 'desc' },
    });

    if (matchingMsg) {
      await db.chatMessage.update({
        where: { id: matchingMsg.id },
        data: { feedback },
      });
    }

    if (feedback === 1) {
      await learnFromConversation(question, answer, lang);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Clear session ────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const guard = securityGuard(request);
    if (guard) return guard;

    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`chat-delete:${clientIp}`, RATE_LIMITS.feedback);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = chatDeleteSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { sessionId, token } = parsed.data;

    const stored = conversations.get(sessionId);
    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const storedToken = (stored as ConversationHistory).token;
    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — invalid session token' },
        { status: 403 }
      );
    }
    conversations.delete(sessionId);
    sessionQueues.delete(sessionId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
