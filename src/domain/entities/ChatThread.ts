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
    const newMessages = [...this.messages, message];
    
    // Auto-generate title from first user message if still using default title
    let newTitle = this.title;
    if (this.title === "New Conversation" && message.role === "user" && this.messages.length === 0) {
      newTitle = this.generateTitleFromContent(message.content);
    }
    
    return new ChatThread(
      this.id,
      newTitle,
      newMessages,
      this.createdAt,
      new Date(),
    );
  }

  private generateTitleFromContent(content: string): string {
    // Clean up the content and create a title
    const cleanContent = content.trim();
    
    // If it's very short, use it as is
    if (cleanContent.length <= 50) {
      return cleanContent;
    }
    
    // If it's longer, truncate and add ellipsis
    const words = cleanContent.split(' ');
    if (words.length <= 8) {
      return cleanContent;
    }
    
    return words.slice(0, 8).join(' ') + '...';
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
