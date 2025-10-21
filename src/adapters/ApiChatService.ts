/**
 * API Chat Service Adapter (Frontend)
 * Presentation layer adapter - calls backend API
 */

import { Message } from "@/domain/entities/Message";
import type { IChatService } from "@/ports/IChatService";
import type {
  ChatRequest,
  ChatResponse,
} from "@/shared/contracts/api.contract";
import type { Attachment } from "@/shared/contracts/chat.contract";

export class ApiChatService implements IChatService {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Abort ongoing streaming request
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async sendMessage(
    content: string,
    attachments?: Attachment[],
    context?: Message[],
    modelId?: string,
  ): Promise<Message> {
    try {
      const requestBody: ChatRequest = {
        content,
        attachments,
        modelId,
        context: context?.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          attachments: msg.attachments,
          isStreaming: msg.isStreaming,
        })),
      };

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      const data: ChatResponse = await response.json();

      return new Message(
        data.message.id,
        data.message.role,
        data.message.content,
        new Date(data.message.timestamp),
        data.message.attachments,
        data.message.isStreaming,
      );
    } catch (error) {
      console.error("API Chat Service Error:", error);
      throw new Error(
        `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async streamMessage(
    content: string,
    attachments: Attachment[] | undefined,
    context: Message[],
    onChunk: (chunk: string) => void,
    modelId?: string,
    threadId?: string,
  ): Promise<Message> {
    try {
      const requestBody: ChatRequest = {
        content,
        attachments,
        modelId,
        threadId,
        context: context?.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          attachments: msg.attachments,
          isStreaming: msg.isStreaming,
        })),
      };

      // Create new abort controller for this request
      this.abortController = new AbortController();

      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stream API Error:", response.status, errorText);
        throw new Error(`Failed to stream message: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullResponse += parsed.chunk;
                onChunk(parsed.chunk);
              }
              // Note: We ignore threadId updates here as they're handled by the use case
            } catch (_e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      return Message.create("assistant", fullResponse);
    } catch (error) {
      // Don't log abort errors as they're user-initiated
      if (error instanceof Error && error.name === "AbortError") {
        throw error; // Re-throw to handle upstream
      }

      console.error("API Streaming Error:", error);
      throw new Error(
        `Failed to stream message: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      this.abortController = null;
    }
  }
}
