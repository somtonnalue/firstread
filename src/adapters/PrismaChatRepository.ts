/**
 * Prisma Chat Repository - Adapter Layer
 * Implements chat persistence using Prisma
 */

import { prisma } from "@/infra/database/prisma";
import type { IChatRepository } from "@/ports/IChatRepository";
import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";

export class PrismaChatRepository implements IChatRepository {
  async getThread(threadId: string, userId?: string): Promise<ChatThread | null> {
    const whereClause: any = { id: threadId };
    if (userId) {
      whereClause.userId = userId;
    }

    const threadData = await prisma.chatThread.findUnique({
      where: whereClause,
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!threadData) return null;

    const messages = threadData.messages.map(
      (msg: any) =>
        new Message(
          msg.id,
          msg.role as "user" | "assistant",
          msg.content,
          msg.timestamp,
          msg.attachments as any,
          msg.isStreaming
        )
    );

    return new ChatThread(
      threadData.id,
      threadData.title ?? "Untitled",
      messages,
      threadData.createdAt,
      threadData.updatedAt
    );
  }

  async getAllThreads(userId?: string): Promise<ChatThread[]> {
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const threadsData = await prisma.chatThread.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return threadsData.map((threadData: any) => {
      const messages = threadData.messages.map(
        (msg: any) =>
          new Message(
            msg.id,
            msg.role as "user" | "assistant",
            msg.content,
            msg.timestamp,
            msg.attachments as any,
            msg.isStreaming
          )
      );

      return new ChatThread(
        threadData.id,
        threadData.title ?? "Untitled",
        messages,
        threadData.createdAt,
        threadData.updatedAt
      );
    });
  }

  async saveThread(thread: ChatThread, userId: string): Promise<void> {
    await prisma.chatThread.upsert({
      where: { id: thread.id },
      create: {
        id: thread.id,
        title: thread.title,
        userId: userId,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        messages: {
          create: thread.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            isStreaming: msg.isStreaming,
            attachments: msg.attachments,
          })),
        },
      },
      update: {
        title: thread.title,
        updatedAt: thread.updatedAt,
        messages: {
          deleteMany: {},
          create: thread.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            isStreaming: msg.isStreaming,
            attachments: msg.attachments,
          })),
        },
      },
    });
  }

  async updateThread(thread: ChatThread, userId: string): Promise<void> {
    await this.saveThread(thread, userId);
  }

  async deleteThread(threadId: string, userId?: string): Promise<void> {
    const whereClause: any = { id: threadId };
    if (userId) {
      whereClause.userId = userId;
    }

    await prisma.chatThread.delete({
      where: whereClause,
    });
  }
}
