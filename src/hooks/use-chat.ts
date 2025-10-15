"use client";

import { useCallback, useState } from "react";
import type { Attachment, Message } from "@/types/chat";

interface UseChatOptions {
  initialMessages?: Message[];
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(
    options.initialMessages || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content,
        timestamp: new Date(),
        attachments,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Simulate API call - Replace with actual API integration
        const assistantMessageId = `msg-${Date.now()}-assistant`;
        setStreamingMessageId(assistantMessageId);

        // Simulate streaming response
        await new Promise((resolve) => setTimeout(resolve, 500));

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content:
            "This is a simulated response. In production, this would connect to your AI API (Claude, OpenAI, etc.) and stream the response.",
          timestamp: new Date(),
          isStreaming: false,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        options.onError?.(
          error instanceof Error ? error : new Error("Failed to send message"),
        );
      } finally {
        setIsLoading(false);
        setStreamingMessageId(null);
      }
    },
    [options],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    streamingMessageId,
    sendMessage,
    clearMessages,
    deleteMessage,
  };
}
