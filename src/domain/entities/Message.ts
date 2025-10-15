/**
 * Message Entity
 * Pure domain logic - framework independent
 */

import type { Attachment, MessageRole } from "@/shared/contracts/chat.contract";

export class Message {
  constructor(
    public readonly id: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly timestamp: Date,
    public readonly attachments?: Attachment[],
    public readonly isStreaming?: boolean,
  ) {}

  static create(
    role: MessageRole,
    content: string,
    attachments?: Attachment[],
  ): Message {
    return new Message(
      `msg-${Date.now()}-${role}`,
      role,
      content,
      new Date(),
      attachments,
      false,
    );
  }

  static createStreaming(
    role: MessageRole,
    content: string = "",
    id?: string,
  ): Message {
    return new Message(
      id || `msg-${Date.now()}-${role}`,
      role,
      content,
      new Date(),
      undefined,
      true,
    );
  }

  updateContent(newContent: string): Message {
    return new Message(
      this.id,
      this.role,
      newContent,
      this.timestamp,
      this.attachments,
      this.isStreaming,
    );
  }

  stopStreaming(): Message {
    return new Message(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      this.attachments,
      false,
    );
  }

  isUser(): boolean {
    return this.role === "user";
  }

  isAssistant(): boolean {
    return this.role === "assistant";
  }

  hasAttachments(): boolean {
    return !!this.attachments && this.attachments.length > 0;
  }
}
