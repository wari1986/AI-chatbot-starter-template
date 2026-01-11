import type { ChatMessage } from '@/types';

type ReplyPayload = {
  reply?: string | null;
};

export const createMessageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const toApiMessages = (messages: ChatMessage[]) =>
  messages.map(({ id, role, content }) => ({ id, role, content }));

export const getReplyText = (data: ReplyPayload | null) => {
  const reply = data?.reply;
  if (typeof reply === 'string' && reply.trim().length > 0) {
    return reply;
  }
  return 'I did not get a response. Please try again in a moment.';
};
