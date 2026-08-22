'use server';

import { generateChatReply, type ChatTurn } from '@/lib/chat';

export async function sendChatMessage(messages: ChatTurn[]) {
  try {
    const result = await generateChatReply(messages);
    return { ok: true as const, reply: result.reply };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'לא הצלחנו לקבל תשובה מה-AI';
    return { ok: false as const, error: message };
  }
}
