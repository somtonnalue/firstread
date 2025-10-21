/**
 * Manage Chat Thread Use Case
 * Application layer - handles thread operations
 */

import type { ChatThread } from "@/domain/entities/ChatThread";
import type { IChatRepository } from "@/ports/IChatRepository";

/**
 * Use case for managing chat threads (clear, delete, export)
 */
export class ManageChatThreadUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async clearThread(threadId: string, userId?: string): Promise<ChatThread> {
    const thread = await this.chatRepository.getThread(threadId, userId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    const clearedThread = thread.clear();
    await this.chatRepository.updateThread(clearedThread, userId || "anonymous");
    return clearedThread;
  }

  async deleteThread(threadId: string, userId?: string): Promise<void> {
    await this.chatRepository.deleteThread(threadId, userId);
  }

  async exportThread(threadId: string, userId?: string): Promise<string> {
    const thread = await this.chatRepository.getThread(threadId, userId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    return JSON.stringify(
      {
        id: thread.id,
        title: thread.title,
        messages: thread.messages,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
      null,
      2,
    );
  }

  async getAllThreads(userId?: string): Promise<ChatThread[]> {
    return this.chatRepository.getAllThreads(userId);
  }
}
