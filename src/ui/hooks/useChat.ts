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
  stopStreaming: () => void;
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
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!thread) return;

      setIsLoading(true);
      setIsStreaming(true);

      // Create abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);

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

        // Don't show error if it was aborted by user
        if (error instanceof Error && error.name !== "AbortError") {
          options.onError?.(error);
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setAbortController(null);
      }
    },
    [thread, options],
  );

  const stopStreaming = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
      setAbortController(null);

      // Mark the current streaming message as complete
      if (streamingMessageId && thread) {
        setThread((prevThread) => {
          if (!prevThread) return prevThread;

          const message = prevThread.messages.find(
            (msg) => msg.id === streamingMessageId,
          );

          if (message) {
            const stoppedMessage = new Message(
              message.id,
              message.role,
              message.content,
              message.timestamp,
              message.attachments,
              false, // Mark as not streaming
            );
            return prevThread.updateMessage(streamingMessageId, stoppedMessage);
          }

          return prevThread;
        });
      }
    }
  }, [abortController, streamingMessageId, thread]);

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
    stopStreaming,
    clearMessages,
    deleteMessage,
    exportChat,
  };
}
