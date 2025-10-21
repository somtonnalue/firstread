/**
 * API Chat Repository - Adapter Layer
 * Client-side repository that calls backend API endpoints
 */

import type { IChatRepository } from "@/ports/IChatRepository";
import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";

export class ApiChatRepository implements IChatRepository {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  async getThread(threadId: string, userId?: string): Promise<ChatThread | null> {
    try {
      console.log("Fetching thread:", threadId);
      const response = await fetch(`${this.baseUrl}/chat/threads/${threadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Thread not found:", threadId);
          return null;
        }
        console.error("Failed to get thread:", response.status, response.statusText);
        throw new Error(`Failed to get thread: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert API response to domain entity
      const messages = data.messages.map((msg: any) =>
        new Message(
          msg.id,
          msg.role as "user" | "assistant",
          msg.content,
          new Date(msg.timestamp),
          msg.attachments,
          msg.isStreaming
        )
      );

      return new ChatThread(
        data.id,
        data.title || "Untitled",
        messages,
        new Date(data.createdAt),
        new Date(data.updatedAt)
      );
    } catch (error) {
      console.error("Failed to get thread:", error);
      throw new Error(`Failed to get thread: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getAllThreads(userId?: string): Promise<ChatThread[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get threads: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.threads.map((threadData: any) => {
        const messages = threadData.messages?.map((msg: any) =>
          new Message(
            msg.id,
            msg.role as "user" | "assistant",
            msg.content,
            new Date(msg.timestamp),
            msg.attachments,
            msg.isStreaming
          )
        ) || [];

        return new ChatThread(
          threadData.id,
          threadData.title || "Untitled",
          messages,
          new Date(threadData.createdAt),
          new Date(threadData.lastMessageAt || threadData.updatedAt)
        );
      });
    } catch (error) {
      console.error("Failed to get threads:", error);
      throw new Error(`Failed to get threads: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async saveThread(thread: ChatThread, userId: string): Promise<void> {
    try {
      console.log("Saving thread:", thread.id, "with", thread.messages.length, "messages");
      const response = await fetch(`${this.baseUrl}/chat/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: thread.id,
          title: thread.title,
          messages: thread.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            attachments: msg.attachments,
            isStreaming: msg.isStreaming,
          })),
          createdAt: thread.createdAt.toISOString(),
          updatedAt: thread.updatedAt.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save thread:", response.status, errorText);
        throw new Error(`Failed to save thread: ${response.statusText}`);
      }
      console.log("Thread saved successfully:", thread.id);
    } catch (error) {
      console.error("Failed to save thread:", error);
      throw new Error(`Failed to save thread: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async updateThread(thread: ChatThread, userId: string): Promise<void> {
    await this.saveThread(thread, userId);
  }

  async deleteThread(threadId: string, userId?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/threads/${threadId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      throw new Error(`Failed to delete thread: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
