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
  userId: string;
  onChunk: (content: string) => void;
}

export interface StreamMessageOutput {
  userMessage: Message;
  assistantMessage: Message;
  thread: ChatThread;
  isNewThread: boolean;
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
    console.log("🔍 [DEBUG] StreamMessageUseCase.execute called");
    console.log("🔍 [DEBUG] Input threadId:", input.threadId || "NO THREAD ID");
    console.log("🔍 [DEBUG] Input userId:", input.userId);
    
    // 1. Get or create thread
    let thread = input.threadId
      ? await this.chatRepository.getThread(input.threadId, input.userId)
      : null;

    console.log("🔍 [DEBUG] Retrieved thread:", thread?.id || "NO THREAD FOUND");
    
    const isNewThread = !thread;
    if (!thread) {
      thread = ChatThread.create();
      console.log("🔍 [DEBUG] Created new thread:", thread.id);
    } else {
      console.log("🔍 [DEBUG] Using existing thread:", thread.id);
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
    console.log("🔍 [DEBUG] About to save thread:", thread.id);
    console.log("🔍 [DEBUG] Thread messages count:", thread.messages.length);
    console.log("🔍 [DEBUG] Is new thread:", isNewThread);
    
    await this.chatRepository.saveThread(thread, input.userId);
    console.log("🔍 [DEBUG] Thread saved successfully");

    return {
      userMessage,
      assistantMessage,
      thread,
      isNewThread,
    };
  }
}
