/**
 * Stream Message Use Case
 * Application layer - handles streaming responses
 */

import { ChatThread } from "@/domain/entities/ChatThread";
import { Message } from "@/domain/entities/Message";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";
import type { Attachment } from "@/shared/contracts/chat.contract";

export interface StreamMessageInput {
  content: string;
  attachments?: Attachment[];
  threadId?: string;
  modelId?: string;
  onChunk: (content: string) => void;
}

export interface StreamMessageOutput {
  userMessage: Message;
  assistantMessage: Message;
  thread: ChatThread;
}

/**
 * Use case for streaming message responses
 */
export class StreamMessageUseCase {
  constructor(
    private readonly chatService: IChatService,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(input: StreamMessageInput): Promise<StreamMessageOutput> {
    // 1. Get or create thread
    let thread = input.threadId
      ? await this.chatRepository.getThread(input.threadId)
      : null;

    if (!thread) {
      thread = ChatThread.create();
    }

    // 2. Create user message
    const userMessage = Message.create(
      "user",
      input.content,
      input.attachments,
    );

    // 3. Add user message to thread
    thread = thread.addMessage(userMessage);

    // 4. Stream AI response
    const assistantMessage = await this.chatService.streamMessage(
      input.content,
      input.attachments,
      thread.messages,
      input.onChunk,
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
