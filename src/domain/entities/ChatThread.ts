/**
 * ChatThread Entity
 * Pure domain logic - framework independent
 */

import type { Message } from "./Message";

export class ChatThread {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly messages: Message[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(title: string = "New Conversation"): ChatThread {
    const now = new Date();
    return new ChatThread(`thread-${Date.now()}`, title, [], now, now);
  }

  addMessage(message: Message): ChatThread {
    return new ChatThread(
      this.id,
      this.title,
      [...this.messages, message],
      this.createdAt,
      new Date(),
    );
  }

  updateMessage(messageId: string, updatedMessage: Message): ChatThread {
    const newMessages = this.messages.map((msg) =>
      msg.id === messageId ? updatedMessage : msg,
    );

    return new ChatThread(
      this.id,
      this.title,
      newMessages,
      this.createdAt,
      new Date(),
    );
  }

  removeMessage(messageId: string): ChatThread {
    return new ChatThread(
      this.id,
      this.title,
      this.messages.filter((msg) => msg.id !== messageId),
      this.createdAt,
      new Date(),
    );
  }

  clear(): ChatThread {
    return new ChatThread(this.id, this.title, [], this.createdAt, new Date());
  }

  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  getLastMessage(): Message | undefined {
    return this.messages[this.messages.length - 1];
  }

  updateTitle(newTitle: string): ChatThread {
    return new ChatThread(
      this.id,
      newTitle,
      this.messages,
      this.createdAt,
      new Date(),
    );
  }
}
