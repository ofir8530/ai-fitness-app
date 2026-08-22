'use client';

import { useState, useRef, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { sendChatMessage } from '@/app/actions/chatActions';
import type { ChatTurn } from '@/lib/chat';

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
};

const CHAT_STORAGE_KEY = 'calceat-chat-history-v1';

const SUGGESTIONS = [
  {
    label: 'רעיון לארוחת ערב',
    text: 'תני לי רעיון לארוחת ערב מהירה ובריאה עד 500 קלוריות',
    bg: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    label: 'לפני אימון',
    text: 'מה כדאי לאכול לפני אימון כוח?',
    bg: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    label: 'שייק חלבון',
    text: 'מתכון לשייק חלבון פשוט בבית',
    bg: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
];

function nowLabel() {
  return new Date().toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') {
      return [
        {
          id: 'welcome',
          role: 'ai',
          text: 'היי! אני יועצת התזונה שלך. שאלי אותי על ארוחות, מתכונים או התאמות ליום שלך.',
          time: nowLabel(),
        },
      ];
    }

    try {
      const saved = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!saved) {
        return [
          {
            id: 'welcome',
            role: 'ai',
            text: 'היי! אני יועצת התזונה שלך. שאלי אותי על ארוחות, מתכונים או התאמות ליום שלך.',
            time: nowLabel(),
          },
        ];
      }

      const parsed = JSON.parse(saved) as Message[];
      return Array.isArray(parsed) && parsed.length ? parsed : [
        {
          id: 'welcome',
          role: 'ai',
          text: 'היי! אני יועצת התזונה שלך. שאלי אותי על ארוחות, מתכונים או התאמות ליום שלך.',
          time: nowLabel(),
        },
      ];
    } catch {
      return [
        {
          id: 'welcome',
          role: 'ai',
          text: 'היי! אני יועצת התזונה שלך. שאלי אותי על ארוחות, מתכונים או התאמות ליום שלך.',
          time: nowLabel(),
        },
      ];
    }
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const toHistory = (list: Message[]): ChatTurn[] =>
    list.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

  const askAi = async (history: Message[]) => {
    setTyping(true);
    setError('');
    const result = await sendChatMessage(toHistory(history));
    setTyping(false);

    if (!result.ok) {
      setError(result.error);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'ai',
          text: 'מצטערת, לא הצלחתי לענות כרגע. בדקי את מפתח ה-AI ונסי שוב.',
          time: nowLabel(),
        },
      ]);
      return;
    }

    const safeReply = typeof result.reply === 'string' ? result.reply.trim() : '';
    if (!safeReply) {
      setError('קיבלנו תשובה ריקה מה-AI');
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now() + 1),
        role: 'ai',
        text: safeReply,
        time: nowLabel(),
      },
    ]);
  };

  const pushUser = async (text: string) => {
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      time: nowLabel(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    await askAi(next);
  };

  const sendMessage = () => {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput('');
    void pushUser(msg);
  };

  return (
    <>
      <AppHeader title="ייעוץ AI" showBack backHref="/dashboard" />
      <div className="relative w-full pt-16 pb-40 bg-surface min-h-screen">
        <div className="px-container-margin py-base flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-4 shadow-sm relative">
            <MaterialIcon
              name="nutrition"
              filled
              className="text-primary text-[40px]"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-surface rounded-full" />
          </div>
          <h1 className="font-headline text-headline-lg-mobile font-bold text-on-surface mb-2">
            ייעוץ תזונה אישי
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-[280px]">
            שאלי בחופשיות — התשובות מגיעות ממנוע AI חי.
          </p>
        </div>

        <div
          ref={messagesRef}
          className="flex flex-col gap-gutter px-container-margin py-section-padding max-w-lg mx-auto overflow-y-auto max-h-[calc(100vh-290px)] pb-28"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[88%] ${
                m.role === 'user' ? 'items-end self-end' : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm mb-1 w-full ${
                  m.role === 'user'
                    ? 'bg-primary text-on-primary rounded-tl-none shadow-md'
                    : 'bg-surface-container-high text-on-surface rounded-tr-none'
                }`}
              >
                <p className="text-body-md leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {m.text}
                </p>
              </div>
              <span
                className={`text-label-sm font-medium text-on-surface-variant/60 ${
                  m.role === 'user' ? 'ml-1' : 'mr-1'
                }`}
              >
                {m.time}
              </span>
            </div>
          ))}

          {messages.length <= 1 && !typing && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-container-margin px-container-margin">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => void pushUser(s.text)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-label-md font-semibold shadow-sm active:scale-95 transition-transform ${s.bg}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {typing && (
            <div className="flex items-center gap-1 bg-surface-container-high px-4 py-3 rounded-2xl rounded-tr-none w-16 animate-pulse">
              <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full" />
              <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full" />
              <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full" />
            </div>
          )}

          {error && (
            <p className="text-label-sm text-error text-center">{error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="fixed bottom-16 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 p-gutter bg-surface/90 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-xl ring-1 ring-black/5">
            <input
              className="flex-1 bg-transparent border-none outline-none text-on-surface text-body-md py-2 px-3 min-w-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="כתבי לי כאן..."
              type="text"
              disabled={typing}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={typing || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full shadow-lg active:scale-90 transition-transform disabled:opacity-50 shrink-0"
              aria-label="שלח"
            >
              <MaterialIcon name="send" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
