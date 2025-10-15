/**
 * useChat Hook - Presentation Layer
 * React hook that uses the application layer through dependency injection
 */

"use client";

import { useCallback, useState } from "react";
import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";
import { clientContainer } from "@/infra/di/container.client";
import type { Attachment } from "@/shared/contracts/chat.contract";

interface UseChatOptions {
  initialMessages?: Message[];
  threadId?: string;
  modelId?: string;
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: Message[];
  thread: ChatThread | null;
  isLoading: boolean;
  streamingMessageId: string | null;
  isStreaming: boolean;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  clearMessages: () => Promise<void>;
  deleteMessage: (messageId: string) => void;
  exportChat: () => Promise<string>;
}

/**
 * React hook for chat functionality
 * Uses hexagonal architecture through DI container
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [thread, setThread] = useState<ChatThread | null>(() => {
    if (options.initialMessages) {
      const initialThread = ChatThread.create();
      return options.initialMessages.reduce(
        (t, msg) => t.addMessage(msg),
        initialThread,
      );
    }
    return ChatThread.create();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!thread) return;

      setIsLoading(true);
      setIsStreaming(true);

      try {
        // Create user message immediately
        const userMessage = Message.create("user", content, attachments);
        let currentThread = thread.addMessage(userMessage);
        setThread(currentThread);

        // Create placeholder for streaming assistant message
        const assistantMessageId = `msg-${Date.now()}-assistant`;

        // Create a mutable reference for the streaming message
        const streamingMessageWithId = new Message(
          assistantMessageId,
          "assistant",
          "",
          new Date(),
          undefined,
          true,
        );

        currentThread = currentThread.addMessage(streamingMessageWithId);
        setThread(currentThread);
        setStreamingMessageId(assistantMessageId);

        let accumulatedContent = "";

        // Use streaming use case
        await clientContainer.streamMessageUseCase.execute({
          content,
          attachments,
          threadId: currentThread.id,
          modelId: options.modelId,
          onChunk: (chunk: string) => {
            accumulatedContent += chunk;

            // Update the streaming message with accumulated content
            setThread((prevThread) => {
              if (!prevThread) return prevThread;

              const updatedMessage = new Message(
                assistantMessageId,
                "assistant",
                accumulatedContent,
                new Date(),
                undefined,
                true,
              );

              return prevThread.updateMessage(
                assistantMessageId,
                updatedMessage,
              );
            });
          },
        });

        // Mark streaming as complete
        setThread((prevThread) => {
          if (!prevThread) return prevThread;

          const finalMessage = new Message(
            assistantMessageId,
            "assistant",
            accumulatedContent,
            new Date(),
            undefined,
            false,
          );

          return prevThread.updateMessage(assistantMessageId, finalMessage);
        });

        setStreamingMessageId(null);
      } catch (error) {
        setStreamingMessageId(null);
        options.onError?.(
          error instanceof Error ? error : new Error("Failed to send message"),
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [thread, options],
  );

  const clearMessages = useCallback(async () => {
    if (!thread) return;

    try {
      const clearedThread =
        await clientContainer.manageChatThreadUseCase.clearThread(thread.id);
      setThread(clearedThread);
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error : new Error("Failed to clear messages"),
      );
    }
  }, [thread, options]);

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!thread) return;
      setThread(thread.removeMessage(messageId));
    },
    [thread],
  );

  const exportChat = useCallback(async (): Promise<string> => {
    if (!thread) return "";

    try {
      return await clientContainer.manageChatThreadUseCase.exportThread(
        thread.id,
      );
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error : new Error("Failed to export chat"),
      );
      return "";
    }
  }, [thread, options]);

  return {
    messages: thread?.messages || [],
    thread,
    isLoading,
    streamingMessageId,
    isStreaming,
    sendMessage,
    clearMessages,
    deleteMessage,
    exportChat,
  };
}
