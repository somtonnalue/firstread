/**
 * In-Memory Chat Repository Adapter
 * Infrastructure layer - stores threads in memory
 * Replace with DatabaseChatRepository for persistence
 */

import type { ChatThread } from "@/domain/entities/ChatThread";
import type { IChatRepository } from "@/ports/IChatRepository";

export class InMemoryChatRepository implements IChatRepository {
  private threads: Map<string, ChatThread> = new Map();

  async saveThread(thread: ChatThread): Promise<void> {
    this.threads.set(thread.id, thread);
  }

  async getThread(threadId: string): Promise<ChatThread | null> {
    return this.threads.get(threadId) || null;
  }

  async getAllThreads(): Promise<ChatThread[]> {
    return Array.from(this.threads.values());
  }

  async deleteThread(threadId: string): Promise<void> {
    this.threads.delete(threadId);
  }

  async updateThread(thread: ChatThread): Promise<void> {
    this.threads.set(thread.id, thread);
  }
}
