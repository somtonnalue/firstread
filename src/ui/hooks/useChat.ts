/**
 * useChat Hook - Presentation Layer
 * React hook that uses the application layer through dependency injection
 */

"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";
import { clientContainer } from "@/infra/di/container.client";
import type { Attachment } from "@/shared/contracts/chat.contract";

interface UseChatOptions {
  initialMessages?: Message[];
  threadId?: string;
  modelId?: string;
  onError?: (error: Error) => void;
  onThreadCreated?: () => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  currentThread: ChatThread | null;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => Promise<void>;
  exportChat: () => Promise<string | null>;
  switchToThread: (threadId: string) => Promise<void>;
  createNewThread: () => Promise<void>;
}

/**
 * React hook for chat functionality
 * Uses hexagonal architecture through DI container
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { data: session } = useSession();
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
        console.log("Sending message with threadId:", currentThread.id);
        const result = await clientContainer.streamMessageUseCase.execute({
          content,
          attachments,
          threadId: currentThread.id,
          modelId: options.modelId,
          userId: session?.user?.id || "anonymous",
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

        // Update the thread with the final result from the use case
        setThread(result.thread);

        setStreamingMessageId(null);

        // Trigger thread created callback if this was a new thread
        if (result.thread.messages.length === 2) { // User message + assistant message = new thread
          options.onThreadCreated?.();
        }

        // Note: Thread is already saved by the use case, no need to save again
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
    // Abort via the client container's chat service
    clientContainer.abortStreaming();

    setIsLoading(false);
    setIsStreaming(false);
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
      setStreamingMessageId(null);
    }
  }, [streamingMessageId, thread]);

  const clearMessages = useCallback(async () => {
    try {
      // Simply create a new thread instead of trying to clear
      const newThread = ChatThread.create();
      setThread(newThread);
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error : new Error("Failed to clear messages"),
      );
    }
  }, [options]);

  const switchToThread = useCallback(async (threadId: string) => {
    try {
      setIsLoading(true);
      const thread = await clientContainer.chatRepository.getThread(threadId, session?.user?.id);
      if (thread) {
        setThread(thread);
        setStreamingMessageId(null);
      } else {
        // If thread not found, create a new one with the same ID
        console.warn(`Thread ${threadId} not found, creating new thread`);
        const newThread = ChatThread.create();
        setThread(newThread);
        setStreamingMessageId(null);
      }
    } catch (error) {
      console.error("Failed to switch thread:", error);
      // Create a new thread as fallback
      const newThread = ChatThread.create();
      setThread(newThread);
      setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  }, [options, session?.user?.id]);

  const createNewThread = useCallback(async () => {
    try {
      const newThread = ChatThread.create();
      setThread(newThread);
      setStreamingMessageId(null);
      console.log("Created new thread:", newThread.id);
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error : new Error("Failed to create new thread"),
      );
    }
  }, [options]);

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!thread) return;
      setThread(thread.removeMessage(messageId));
    },
    [thread],
  );

  const exportChat = useCallback(async (): Promise<string | null> => {
    if (!thread) return null;

    try {
      return await clientContainer.manageChatThreadUseCase.exportThread(
        thread.id,
        session?.user?.id,
      );
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error : new Error("Failed to export chat"),
      );
      return null;
    }
  }, [thread, options, session?.user?.id]);

  return {
    messages: thread?.messages || [],
    isLoading,
    isStreaming,
    streamingMessageId,
    currentThread: thread,
    sendMessage,
    stopStreaming,
    clearMessages,
    exportChat,
    switchToThread,
    createNewThread,
  };
}
