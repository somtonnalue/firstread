/**
 * Chat Repository Port (Interface)
 * Defines the contract for chat persistence
 */

import type { ChatThread } from "@/domain/entities/ChatThread";

export interface IChatRepository {
  /**
   * Save a chat thread
   */
  saveThread(thread: ChatThread, userId: string): Promise<void>;

  /**
   * Get a chat thread by ID
   */
  getThread(threadId: string, userId?: string): Promise<ChatThread | null>;

  /**
   * Get all chat threads
   */
  getAllThreads(userId?: string): Promise<ChatThread[]>;

  /**
   * Delete a chat thread
   */
  deleteThread(threadId: string, userId?: string): Promise<void>;

  /**
   * Update a chat thread
   */
  updateThread(thread: ChatThread, userId: string): Promise<void>;
}
