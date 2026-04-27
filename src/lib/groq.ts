/**
 * Groq API Helper
 * Direct Groq API calls — works with Render, Vercel, or any Node.js server
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── Types ──────────────────────────────────────────────────────────────

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | GroqContentPart[];
}

export interface GroqContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface GroqChatOptions {
  model?: string;
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
  tools?: GroqTool[];
  tool_choice?: 'auto' | 'none' | { type: string; name: string };
}

export interface GroqTool {
  type: 'web_search' | 'function';
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  function?: {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
  };
}

export interface GroqNonStreamResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ── Models (Smart 3-Model Routing) ────────────────────────────────────────
// Each model has its own rate limit quota. By routing intelligently,
// we get ~3x the daily capacity compared to using a single model.

export const GROQ_MODELS = {
  /** ⚡ Fast & cheap — for simple chat queries (~70% of traffic) */
  chatFast: 'openai/gpt-oss-20b',
  /** 💬 Best quality + web search — for complex queries & search (~25% of traffic) */
  chat: 'llama-3.3-70b-versatile',
  /** 🧠 Vision + chat + web search — for image analysis (~5% of traffic) */
  vision: 'meta-llama/llama-4-scout-17b-16e-instruct',
} as const;

// ── Core API Call ──────────────────────────────────────────────────────

export async function groqChat(
  messages: GroqMessage[],
  options: GroqChatOptions = {}
): Promise<Response> {
  const {
    model = GROQ_MODELS.chat,
    temperature = 0.4,
    stream = false,
    max_tokens,
    tools,
    tool_choice,
  } = options;

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
  };

  if (stream) body.stream = true;
  if (max_tokens) body.max_tokens = max_tokens;
  if (tools?.length) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  return response;
}

// ── Non-streaming helper ───────────────────────────────────────────────

export async function groqChatJSON(
  messages: GroqMessage[],
  options: Omit<GroqChatOptions, 'stream'> = {}
): Promise<GroqNonStreamResponse> {
  const response = await groqChat(messages, { ...options, stream: false });
  return response.json() as Promise<GroqNonStreamResponse>;
}

// ── Vision helper ──────────────────────────────────────────────────────

export async function groqVision(
  messages: GroqMessage[],
  options: { model?: string; temperature?: number } = {}
): Promise<Response> {
  return groqChat(messages, {
    ...options,
    model: options.model || GROQ_MODELS.vision,
  });
}

export async function groqVisionJSON(
  messages: GroqMessage[],
  options: { model?: string; temperature?: number } = {}
): Promise<GroqNonStreamResponse> {
  const response = await groqVision(messages, options);
  return response.json() as Promise<GroqNonStreamResponse>;
}

// ── Web Search (Groq built-in tool) ────────────────────────────────────

export async function groqWebSearch(
  query: string,
  options: { model?: string; lang?: 'id' | 'en' } = {}
): Promise<string> {
  const { model = GROQ_MODELS.chat, lang = 'id' } = options;

  const systemPrompt = lang === 'id'
    ? 'Kamu adalah asisten pencarian. Cari informasi terbaru tentang pertanyaan user. Berikan hasilnya dalam format ringkas dengan URL sumbernya. Jawab dalam bahasa Indonesia.'
    : 'You are a search assistant. Find the latest information about the user\'s question. Provide results in a concise format with source URLs. Answer in English.';

  try {
    const response = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ], {
      model,
      temperature: 0.3,
      tools: [{ type: 'web_search' as const }],
    });

    const data = await response.json() as GroqNonStreamResponse;
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq web search failed:', error);
    return '';
  }
}
