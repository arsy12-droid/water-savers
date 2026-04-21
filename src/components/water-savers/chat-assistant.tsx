'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, User, ThumbsUp, ThumbsDown, Sparkles, Search, RotateCcw, Camera, ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '@/hooks/use-language';
import { usePanelStore } from '@/stores/panel-store';

// Bug #29: Use crypto.randomUUID for truly unique IDs
const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: number | null;
  question?: string;
  searched?: boolean;
  image?: string; // base64 preview for user-uploaded images
}

// Bug #22: Synced with server SEARCH_TRIGGERS in route.ts
const SEARCH_KEYWORDS = [
  'hari ini', 'sekarang', 'terbaru', 'terkini', 'tahun ini', 'bulan ini',
  'tahun 2024', 'tahun 2025', 'berita', 'kabar', 'update', 'cuaca', 'prakiraan',
  'banjir', 'kekeringan', 'el nino', 'la nina', 'krisis air', 'wabah', 'musim',
  'kemarin', 'besok', 'minggu ini',
  'latest', 'current', 'recent', 'news', 'today', 'now', 'this year',
  '2024', '2025', 'forecast', 'weather', 'flood', 'drought', 'happening',
];

const MAX_CHAT_MESSAGES = 80;

// ── Markdown Components (extracted outside render to avoid re-creation per message) ──

const MARKDOWN_COMPONENTS = {
  p: ({ children }: { children: React.ReactNode }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
    const safeHref = href && !href.startsWith('javascript:') && !href.startsWith('data:') && !href.startsWith('vbscript:') ? href : undefined;
    return safeHref ? (
      <a href={safeHref} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300 break-all">
        {children}
      </a>
    ) : (
      <span className="text-gray-400 line-through">{children}</span>
    );
  },
  ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside my-1 space-y-0.5">{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }: { children: React.ReactNode }) => <strong className="font-bold">{children}</strong>,
  code: ({ className, children, ...props }: { className?: string; children: React.ReactNode }) => {
    if (!className) {
      return <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>;
    }
    return <code className={`${className} block`}{...props}>{children}</code>;
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 my-1.5 overflow-x-auto text-xs font-mono leading-relaxed border border-gray-200 dark:border-gray-700">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-2 border-cyan-400 dark:border-cyan-600 pl-3 my-1.5 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-1.5">
      <table className="text-xs border-collapse w-full">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-800 font-semibold text-left">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>
  ),
  hr: () => <hr className="my-2 border-gray-300 dark:border-gray-600" />,
  h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
  h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-sm font-bold mt-1.5 mb-0.5">{children}</h2>,
  h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-sm font-semibold mt-1 mb-0.5">{children}</h3>,
};

const INITIAL_MESSAGES_ID = {
  id: 'Hai! 💧 Saya AquAI, asisten dari Water Savers Team. Tanyakan apa saja tentang air — hemat air, kesehatan air, laut Indonesia, sains air, iklim, budaya, dan lainnya! Saya juga bisa cari info terbaru dari internet lho 🌐',
  en: "Hi! 💧 I'm AquAI from Water Savers Team. Ask me anything about water — saving water, water health, oceans, water science, climate, culture, and more! I can also search the web for the latest info 🌐",
};

export default function ChatAssistant() {
  const { t, lang } = useLanguage();
  const { activePanel, openPanel, closePanel } = usePanelStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [learningCount, setLearningCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCameraPicker, setShowCameraPicker] = useState(false);
  // Separate animation state — panel stays in DOM during exit animation
  const [cameraPickerAnimating, setCameraPickerAnimating] = useState(false);

  // Prevent hydration mismatch — render identical placeholder on server & first client paint
  useEffect(() => { setMounted(true); }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(generateId());
  const sessionTokenRef = useRef('');
  const initialized = useRef(false);
  const lastQuestionRef = useRef('');
  const streamingMsgIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0); // Prevents stale updates after handleClear

  // Dropdown panel visibility
  const [chatContentVisible, setChatContentVisible] = useState(false);

  const closeChat = useCallback(() => {
    setChatContentVisible(false);
    setShowCameraPicker(false);
    setCameraPickerAnimating(false);
    setTimeout(() => setIsOpen(false), 400);
    closePanel('chat');
  }, [closePanel]);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openPanel('chat');
      setIsOpen(true);
      setChatContentVisible(true);
    }
  }, [isOpen, closeChat, openPanel]);

  const prevActivePanel = useRef(activePanel);

  // Close chat when another panel opens
  useEffect(() => {
    if (prevActivePanel.current !== activePanel) {
      prevActivePanel.current = activePanel;
      const frame = requestAnimationFrame(() => {
        if (activePanel && activePanel !== 'chat' && isOpen) {
          closeChat();
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [activePanel, isOpen, closeChat]);

  // Scroll to bottom on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch learning count
  useEffect(() => {
    fetch('/api/chat/knowledge')
      .then((r) => r.json())
      .then((d) => setLearningCount(d.count || 0))
      .catch(() => {});
  }, []);

  // Initialize messages on client only (avoid hydration mismatch)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: INITIAL_MESSAGES_ID[lang] || INITIAL_MESSAGES_ID.id,
          timestamp: new Date(),
        },
      ]);
    }
  }, [lang]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cameraPickerRef = useRef<HTMLDivElement>(null);
  const cameraPickerDropdownRef = useRef<HTMLDivElement>(null);

  // Handle image selection (gallery or camera)
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return; // Invalid type
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
    setShowCameraPicker(false);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showCameraPicker) return;
    const close = () => {
      setCameraPickerAnimating(false);
      setTimeout(() => setShowCameraPicker(false), 550);
    };
    // Delay click listener so the current click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', close);
    };
  }, [showCameraPicker]);

  // Position dropdown above the camera button & trigger enter animation
  useEffect(() => {
    if (!showCameraPicker || !cameraPickerRef.current || !cameraPickerDropdownRef.current) return;
    const btnRect = cameraPickerRef.current.getBoundingClientRect();
    const dropdown = cameraPickerDropdownRef.current;
    dropdown.style.left = `${btnRect.left}px`;
    // Place bottom of dropdown above top of camera button (8px gap)
    dropdown.style.bottom = `${window.innerHeight - btnRect.top + 8}px`;
    // Trigger enter animation on next frame (after DOM paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCameraPickerAnimating(true);
      });
    });
  }, [showCameraPicker]);

  // Remove selected image
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageFile(null);
  }, []);

  // Send image for VLM analysis
  const handleSendImage = async () => {
    if (!selectedImageFile || isAnalyzing) return;

    const currentGen = ++generationRef.current;
    setIsAnalyzing(true);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim() || (lang === 'id' ? '📷 Analisis gambar ini' : '📷 Analyze this image'),
      timestamp: new Date(),
      image: selectedImage,
    };

    setMessages((prev) => [...prev, userMessage].slice(-MAX_CHAT_MESSAGES));
    setInput('');

    const assistantId = generateId();
    streamingMsgIdRef.current = assistantId;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage].slice(-MAX_CHAT_MESSAGES));

    try {
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      formData.append('prompt', input.trim());
      formData.append('sessionId', sessionIdRef.current);

      const res = await fetch('/api/chat/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.content) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: data.content } : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: data.error || (lang === 'id' ? 'Gagal menganalisis gambar. 💧' : 'Failed to analyze image. 💧') }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: lang === 'id' ? 'Tidak bisa terhubung ke server. 💧' : 'Cannot connect to server. 💧' }
            : m
        )
      );
    } finally {
      if (generationRef.current === currentGen) {
        setIsAnalyzing(false);
        streamingMsgIdRef.current = null;
      }
      handleRemoveImage();
    }
  };

  const handleSend = async (overrideText?: string) => {
    // If image is selected, use image handler
    if (selectedImageFile) {
      await handleSendImage();
      return;
    }

    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const currentGen = ++generationRef.current;
    lastQuestionRef.current = text;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage].slice(-MAX_CHAT_MESSAGES));
    setInput('');
    setIsLoading(true);

    // Show search indicator if query likely needs real-time info
    const needsSearch = SEARCH_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));
    if (needsSearch) setIsSearching(true);

    // Create a placeholder assistant message that will be updated during streaming
    const assistantId = generateId();
    streamingMsgIdRef.current = assistantId;

    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      question: text,
    };
    setMessages((prev) => [...prev, assistantMessage].slice(-MAX_CHAT_MESSAGES));

    try {
      // Bug #8: Create AbortController for this request
      abortControllerRef.current = new AbortController();

      const res = await fetch('/api/chat?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          lang,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let searched = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);

            if (currentEvent === 'meta') {
              try {
                const meta = JSON.parse(dataStr);
                if (meta.token) sessionTokenRef.current = meta.token;
                searched = !!meta.searched;
              } catch {}
            } else if (currentEvent === 'chunk') {
              try {
                const chunk = JSON.parse(dataStr);
                if (chunk.content) {
                  fullContent += chunk.content;
                  // Update the assistant message in real-time
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: fullContent }
                        : m
                    )
                  );
                }
              } catch {}
            } else if (currentEvent === 'done') {
              // Streaming complete
            }

            currentEvent = '';
          }
        }
      }

      // Update final state of the assistant message with searched flag
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: fullContent || (lang === 'id' ? 'Maaf, terjadi kesalahan. 💧' : 'Sorry, an error occurred. 💧'), searched }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: lang === 'id' ? 'Maaf, tidak bisa terhubung ke server. 💧' : 'Sorry, cannot connect to server. 💧' }
            : m
        )
      );
    } finally {
      if (generationRef.current === currentGen) {
        setIsLoading(false);
        setIsSearching(false);
        streamingMsgIdRef.current = null;
      }
      abortControllerRef.current = null;
    }
  };

  const handleFeedback = async (message: Message, feedback: number) => {
    // Update local state
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
      )
    );

    // Bug #2: Send 0 (remove) instead of null to server
    const serverFeedback = message.feedback === feedback ? 0 : feedback;

    try {
      await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          token: sessionTokenRef.current,
          question: message.question || lastQuestionRef.current,
          answer: message.content,
          feedback: serverFeedback,
          lang,
        }),
      });

      // Refresh learning count
      const res = await fetch('/api/chat/knowledge');
      const data = await res.json();
      setLearningCount(data.count || 0);
    } catch {
      // ignore
    }
  };

  const handleClear = async () => {
    setIsResetting(true);
    generationRef.current++; // Invalidate in-flight handleSend
    // Bug #8: Abort any in-flight streaming request
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    const oldSessionId = sessionIdRef.current;
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: INITIAL_MESSAGES_ID[lang] || INITIAL_MESSAGES_ID.id,
      timestamp: new Date(),
    }]);
    const oldToken = sessionTokenRef.current;
    sessionIdRef.current = generateId();
    sessionTokenRef.current = '';
    lastQuestionRef.current = '';
    try {
      await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: oldSessionId, token: oldToken }),
      });
    } catch {
      // ignore
    }
    // Safety timeout: ensure isResetting resets even if animation event doesn't fire
    setTimeout(() => setIsResetting(false), 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-ocean-600" aria-hidden="true" />
    );
  }

  return (
    <>
      {/* Floating Button — z-50 so it's always clickable */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-ocean-600 text-white shadow-lg flex items-center justify-center cursor-pointer group transition-[transform,box-shadow,opacity] duration-300 ease-out ${
          isOpen
            ? 'shadow-cyan-500/20 scale-100 hover:scale-105'
            : 'shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-110 active:scale-95'
        }`}
        aria-label={t('chat_label')}
      >
        {/* Morphing icon container — rotates like sun/moon toggle */}
        <div className="relative w-8 h-8">
          <MessageCircle
            className={`h-6 w-6 absolute inset-0 m-auto transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOpen
                ? 'opacity-0 rotate-90 scale-50'
                : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <X
            className={`h-6 w-6 absolute inset-0 m-auto transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOpen
                ? 'opacity-100 -rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-50'
            }`}
          />
        </div>
        {/* Green dot — flows into button like water droplet absorbed */}
        <span
          className={`absolute w-4 h-4 bg-emerald-400 rounded-full border-2 border-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isOpen
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0'
              : '-top-1 -right-1 scale-100 opacity-100 animate-pulse'
          }`}
          style={{ transitionDelay: isOpen ? '0ms' : '600ms' }}
        />
      </button>

      {/* Subtle backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/0 transition-colors duration-300 ease-out ${
          isOpen ? 'bg-black/8 pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Chat Dropdown Panel */}
      <div className={`chat-dropdown-panel glass-panel prismatic-border prismatic-caustic ${chatContentVisible ? 'visible' : ''}`}>
        <div className="chat-dropdown-inner flex flex-col h-full rounded-2xl">
          {/* Header */}
          <div className="chat-panel-section flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500 to-ocean-600 text-white shrink-0 rounded-t-2xl" style={{ '--section-delay': '0.18s' } as React.CSSProperties}>
            <div className="flex items-center gap-0.5">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
                <img src="/aquai-avatar.png" alt="AquAI" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
              <div className="pl-2">
                <h3 className="text-sm font-bold leading-tight">AquAI 💧</h3>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-white/70">
                    {lang === 'id' ? 'Asisten Air AI' : 'AI Water Assistant'}
                  </p>
                  {learningCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-white/15 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="h-2.5 w-2.5" />
                      {learningCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-3.5 -mr-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={lang === 'id' ? 'Reset pesan' : 'Reset messages'}
            >
              <RotateCcw
                className={`h-7 w-7 ${isResetting ? 'animate-[spin_0.5s_ease-in-out]' : ''}`}
                style={isResetting ? { animationDirection: 'reverse' } : undefined}
                onAnimationEnd={() => setIsResetting(false)}
              />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-panel-section flex-1 overflow-y-auto px-4 py-0" style={{ '--section-delay': '0.28s' } as React.CSSProperties}>
            <div className="space-y-3 pt-3 pb-3">
              {messages.map((msg) => {
                // Don't render empty streaming message — typing indicator handles it
                if ((isLoading || isAnalyzing) && msg.id === streamingMsgIdRef.current && msg.content === '') return null;
                return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-ocean-100 dark:bg-ocean-800'
                        : 'bg-cyan-100 dark:bg-cyan-900'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-6 w-6 text-ocean-600 dark:text-ocean-300" />
                    ) : (
                      <img src="/aquai-avatar.png" alt="AquAI" className="w-full h-full rounded-full object-cover" loading="lazy" decoding="async" />
                    )}
                  </div>
                  <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-ocean-600 text-white rounded-tr-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          {/* Bug #27: Skip markdown render for empty content */}
                          {msg.content ? (
                            <div className="prose-chat">
                            <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MARKDOWN_COMPONENTS}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          </div>
                          ) : null}
                          {/* Blinking cursor during streaming */}
                          {isLoading && msg.id === streamingMsgIdRef.current && msg.content.length > 0 && !isSearching && (
                            <span className="inline-block w-1.5 h-4 bg-gray-500 dark:bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
                          )}
                        </>
                      ) : (
                        <>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Uploaded image"
                              className="max-h-40 w-auto rounded-lg mb-2 cursor-pointer"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = msg.image;
                                a.download = 'aquai-image.jpg';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                            />
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </>
                      )}
                    </div>
                    {/* Feedback buttons for assistant messages — hide during streaming */}
                    {msg.role === 'assistant' && !isLoading && msg.content.length > 0 && msg.id !== messages[0]?.id && (
                      <div className="flex items-center gap-0.5 mt-1 ml-1">
                        {msg.searched && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 dark:text-blue-400 mr-1">
                            <Search className="h-2.5 w-2.5" />
                            {lang === 'id' ? 'Web' : 'Web'}
                          </span>
                        )}
                        <button
                          onClick={() => handleFeedback(msg, 1)}
                          className={`p-1 rounded-md transition-all cursor-pointer ${
                            msg.feedback === 1
                              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'text-gray-300 dark:text-gray-600 hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                          }`}
                          title={lang === 'id' ? 'Jawaban bagus — AquAI belajar!' : 'Good answer — AquAI learns!'}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg, -1)}
                          className={`p-1 rounded-md transition-all cursor-pointer ${
                            msg.feedback === -1
                              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                          }`}
                          title={lang === 'id' ? 'Jawaban kurang tepat' : 'Not accurate'}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        {msg.feedback === 1 && (
                          <span className="text-[10px] text-emerald-500 ml-1">
                            {lang === 'id' ? 'Dipelajari ✓' : 'Learned ✓'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}

              {/* Typing indicator — only show when streaming/analyzing hasn't produced content yet */}
              {(isLoading || isAnalyzing) && messages.length > 0 && messages[messages.length - 1].content === '' && (
                <div className="flex gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    <img src="/aquai-avatar.png" alt="AquAI" className="w-full h-full rounded-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3">
                    {isSearching ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Search className="h-3 w-3 animate-pulse" />
                        <span>{lang === 'id' ? 'Mencari info terbaru...' : 'Searching for latest info...'}</span>
                      </div>
                    ) : isAnalyzing ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Camera className="h-3 w-3 animate-pulse" />
                        <span>{lang === 'id' ? 'Menganalisis gambar...' : 'Analyzing image...'}</span>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {(lang === 'id'
                ? ['Kenapa laut asin?', 'Berita banjir hari ini', 'Tips hemat air di rumah']
                : ['Why is ocean salty?', 'Flood news today', 'Home water-saving tips']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    handleSend(suggestion);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all cursor-pointer border border-cyan-200/50 dark:border-cyan-800/30 hover:shadow-sm active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-panel-section px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0" style={{ '--section-delay': '0.36s' } as React.CSSProperties}>
            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-2 relative group">
                <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={selectedImage} alt="Preview" className="h-24 w-auto max-w-full object-cover rounded-xl" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                    aria-label="Hapus gambar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {/* Hidden file inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isAnalyzing}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isAnalyzing}
            />
            <div className="flex gap-2">
              {/* Camera / Gallery picker button */}
              <div className="relative shrink-0" ref={cameraPickerRef}>
                {isAnalyzing ? (
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showCameraPicker) {
                        // Animate out first, then unmount
                        setCameraPickerAnimating(false);
                        setTimeout(() => setShowCameraPicker(false), 550);
                      } else {
                        setShowCameraPicker(true);
                      }
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      showCameraPicker
                        ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                    title={lang === 'id' ? 'Ambil atau upload gambar' : 'Take or upload image'}
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'id' ? 'Tanya tentang hemat air...' : 'Ask about water conservation...'}
                aria-label={lang === 'id' ? 'Tanya tentang hemat air' : 'Ask about water conservation'}
                disabled={isLoading || isAnalyzing}
                className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImageFile) || isLoading || isAnalyzing}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-ocean-600 text-white flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 text-center drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] leading-relaxed">
              {lang === 'id'
                ? `💡 AquAI belajar dari feedback kamu — 👍 membantu AquAI lebih pintar. 🌐 Dapat mencari info terbaru. 📷 Upload foto terkait air.`
                : `💡 AquAI learns from your feedback — 👍 helps AquAI get smarter. 🌐 Can search latest info. 📷 Upload water-related photos.`}
            </p>
          </div>
        </div>
      </div>

      {/* Camera picker dropdown — rendered OUTSIDE chat-dropdown-panel to avoid overflow:hidden + filter containing block clipping */}
      {showCameraPicker && isOpen && (
        <div className="fixed inset-0 z-[45] pointer-events-none" onClick={() => {
          setCameraPickerAnimating(false);
          setTimeout(() => setShowCameraPicker(false), 550);
        }}>
          <div
            className={`camera-picker-panel prismatic-border prismatic-caustic ${cameraPickerAnimating ? 'visible' : ''} pointer-events-auto`}
            ref={cameraPickerDropdownRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="camera-picker-item"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/15 shrink-0">
                <Camera className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-[13px] font-medium">{lang === 'id' ? 'Kamera' : 'Camera'}</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{lang === 'id' ? 'Ambil foto langsung' : 'Take a photo'}</p>
              </div>
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="camera-picker-item"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ocean-100 dark:bg-white/10 shrink-0">
                <ImageIcon className="h-3.5 w-3.5 text-ocean-600 dark:text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-[13px] font-medium">{lang === 'id' ? 'Galeri' : 'Gallery'}</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{lang === 'id' ? 'Pilih dari file' : 'Choose from files'}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
