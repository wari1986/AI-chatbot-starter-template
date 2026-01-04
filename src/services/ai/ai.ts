import type { ChatBotAgentResponse, ChatMessage } from '@/types';
import { apiClient } from '@/lib/http/axios';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

type ChatBotAgentRequest = {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
};

const fetchChatBotAgent = async ({
  messages,
  provider,
  model,
}: ChatBotAgentRequest): Promise<ChatBotAgentResponse> => {
  const response = await apiClient.post<ChatBotAgentResponse>('/api/chatBotAgent', {
    messages: messages.map(({ role, content }) => ({ role, content })),
    provider,
    model,
  });

  return response.data;
};

const useChatBotAgent = (): UseMutationResult<ChatBotAgentResponse, Error, ChatBotAgentRequest> => {
  return useMutation({
    mutationFn: (payload: ChatBotAgentRequest) => fetchChatBotAgent(payload),
  });
};

export { useChatBotAgent };
