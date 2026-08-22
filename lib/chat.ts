'use server';

import OpenAI from 'openai';

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `את יועצת תזונה וכושר אישית באפליקציית Calceat.
עני בעברית, בקצרה ובצורה חמה ומעשית.
תני המלצות בריאותיות כלליות בלבד — לא אבחנה רפואית.
אם שואלים על מתכון/ארוחה/אימון — הצעי פתרון קונקרטי עם כמויות או צעדים קצרים.`;

export async function trimChatHistory(messages: ChatTurn[], maxMessages = 5): Promise<ChatTurn[]> {
  const seen = new Set<string>();
  const normalized = messages.reduce<ChatTurn[]>((acc, message) => {
    if (!message || typeof message.content !== 'string') return acc;

    const cleanContent = message.content.trim();
    if (!cleanContent || seen.has(cleanContent)) return acc;

    seen.add(cleanContent);
    acc.push({ role: message.role, content: cleanContent });
    return acc;
  }, []);

  return normalized.slice(-Math.max(1, maxMessages));
}

async function chatWithGemini(messages: ChatTurn[]) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const recentMessages = await trimChatHistory(messages, 5);
    const payload = {
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        ...recentMessages.map((message) => ({
          role: message.role,
          parts: [{ text: message.content }],
        })),
      ],
      generationConfig: { temperature: 0, maxOutputTokens: 2000 },
    };

    console.log('[chatWithGemini] trimmed messages:', recentMessages);
    console.log('[chatWithGemini] request payload:', payload);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.warn('Gemini chat error:', response.status, text);
      return null;
    }

    const data = await response.json();
    console.log('[chatWithGemini] raw response:', data);
    const reply = (
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('')
        ?.trim() || null
    );

    return reply ? reply.replace(/```json|```/g, '').trim() || null : null;
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return null;
  }
}

async function chatWithOpenAI(messages: ChatTurn[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('OpenAI Chat Error:', error);
    return null;
  }
}

export async function generateChatReply(messages: ChatTurn[]) {
  if (!messages.length) {
    throw new Error('אין הודעה לשליחה');
  }

  const trimmedMessages = await trimChatHistory(messages, 5);
  console.log('[generateChatReply] trimmed messages:', trimmedMessages);

  try {
    const geminiReply = await chatWithGemini(trimmedMessages);
    if (geminiReply) return { reply: geminiReply, provider: 'gemini' as const };

    const openAiReply = await chatWithOpenAI(messages);
    if (openAiReply) return { reply: openAiReply, provider: 'openai' as const };

    throw new Error(
      'שירות ה-AI אינו זמין. הוסיפי GEMINI_API_KEY או OPENAI_API_KEY לקובץ .env'
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'שגיאה בתקשורת עם ה-AI';
    console.error('Chat AI error:', message);
    throw new Error(message);
  }
}