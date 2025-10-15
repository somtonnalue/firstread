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

  async clearThread(threadId: string): Promise<ChatThread> {
    const thread = await this.chatRepository.getThread(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    const clearedThread = thread.clear();
    await this.chatRepository.updateThread(clearedThread);
    return clearedThread;
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.chatRepository.deleteThread(threadId);
  }

  async exportThread(threadId: string): Promise<string> {
    const thread = await this.chatRepository.getThread(threadId);
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

  async getAllThreads(): Promise<ChatThread[]> {
    return this.chatRepository.getAllThreads();
  }
}
