'use client';

import { useState } from 'react';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrainingStatus } from '@/hooks/use-training';
import { sendMessage } from '@/lib/api-client';
import type { ChatMessage } from '@/types';

interface ChatPreviewModalProps {
  widgetId: string;
}

export function ChatPreviewModal({ widgetId }: ChatPreviewModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const { data: trainingStatus } = useTrainingStatus(widgetId);

  const isTrainingComplete = trainingStatus?.status === 'completed';
  const isTrainingInProgress =
    trainingStatus?.status === 'queued' || trainingStatus?.status === 'processing';

  const handleSend = async () => {
    if (!input.trim() || !isTrainingComplete) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(widgetId, input, conversationId);
      setConversationId(response.conversationId);
      setMessages((prev) => [...prev, response.response]);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Test Chat Preview</h3>
          <p className="text-sm text-muted-foreground">
            Test your AI responses before going live
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {!isTrainingComplete && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                {isTrainingInProgress
                  ? 'Training in Progress'
                  : 'Training Required'}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {isTrainingInProgress
                  ? 'Please wait for training to complete before testing the chat.'
                  : 'Add training sources and run training before you can test the chat.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="h-[400px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isTrainingComplete
                    ? 'Send a message to test your AI assistant'
                    : 'Training must be completed to use chat preview'}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.confidence !== undefined && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Confidence: {(message.confidence * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isTrainingComplete
                  ? 'Type your message...'
                  : 'Complete training to enable chat'
              }
              disabled={!isTrainingComplete || isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!isTrainingComplete || isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
