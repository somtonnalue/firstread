/**
 * Chat Service Port (Interface)
 * Defines the contract for chat operations
 */

import type { Message } from "@/domain/entities/Message";
import type { Attachment } from "@/shared/contracts/chat.contract";

export interface IChatService {
  /**
   * Send a message and receive a response
   * @param content - The message content
   * @param attachments - Optional file attachments
   * @param context - Previous messages for context
   * @param modelId - Optional model ID to use for this request
   * @returns Promise of the assistant's response message
   */
  sendMessage(
    content: string,
    attachments?: Attachment[],
    context?: Message[],
    modelId?: string,
  ): Promise<Message>;

  /**
   * Send a message with streaming response
   * @param content - The message content
   * @param attachments - Optional file attachments
   * @param context - Previous messages for context
   * @param onChunk - Callback for each chunk of the response
   * @param modelId - Optional model ID to use for this request
   * @returns Promise of the complete response message
   */
  streamMessage(
    content: string,
    attachments: Attachment[] | undefined,
    context: Message[],
    onChunk: (chunk: string) => void,
    modelId?: string,
  ): Promise<Message>;
}
