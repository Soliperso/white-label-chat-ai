import { useState, useCallback } from 'react';
import { sendMessage as apiSendMessage } from '@/lib/api-client';
import type { ChatMessage } from '@/types';

interface UseChatOptions {
  widgetId: string;
  welcomeMessage?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat({ widgetId, welcomeMessage }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (welcomeMessage) {
      return [{
        id: 'welcome',
        conversationId: '',
        content: welcomeMessage,
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
      }];
    }
    return [];
  });
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      conversationId: conversationId || '',
      content: text,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiSendMessage(widgetId, text, conversationId);

      // Store conversation ID
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant response
      setMessages(prev => [...prev, response.response]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        conversationId: conversationId || '',
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, conversationId, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages(welcomeMessage ? [{
      id: 'welcome',
      conversationId: '',
      content: welcomeMessage,
      role: 'assistant',
      timestamp: new Date().toISOString(),
    }] : []);
    setConversationId(undefined);
    setError(null);
  }, [welcomeMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
