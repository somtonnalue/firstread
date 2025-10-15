/**
 * Send Message Use Case
 * Application layer - orchestrates domain logic
 */

import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";
import type { Attachment } from "@/shared/contracts/chat.contract";

export interface SendMessageInput {
  content: string;
  attachments?: Attachment[];
  threadId?: string;
  modelId?: string;
}

export interface SendMessageOutput {
  userMessage: Message;
  assistantMessage: Message;
  thread: ChatThread;
}

/**
 * Use case for sending a message and receiving a response
 * Follows single responsibility principle
 */
export class SendMessageUseCase {
  constructor(
    private readonly chatService: IChatService,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    // 1. Get or create thread
    let thread = input.threadId
      ? await this.chatRepository.getThread(input.threadId)
      : null;

    if (!thread) {
      thread = ChatThread.create();
    }

    // 2. Create user message (domain entity)
    const userMessage = Message.create(
      "user",
      input.content,
      input.attachments,
    );

    // 3. Add user message to thread
    thread = thread.addMessage(userMessage);

    // 4. Get AI response through port
    const assistantMessage = await this.chatService.sendMessage(
      input.content,
      input.attachments,
      thread.messages,
      input.modelId,
    );

    // 5. Add assistant message to thread
    thread = thread.addMessage(assistantMessage);

    // 6. Persist thread
    await this.chatRepository.updateThread(thread);

    return {
      userMessage,
      assistantMessage,
      thread,
    };
  }
}
