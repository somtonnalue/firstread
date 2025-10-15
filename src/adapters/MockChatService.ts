/**
 * Mock Chat Service Adapter
 * Infrastructure layer - simulates AI responses
 * This will be replaced with real AI adapters (OpenAI, Anthropic, etc.)
 */

import { Message } from "@/domain/entities/Message";
import type { IChatService } from "@/ports/IChatService";
import type { Attachment } from "@/shared/contracts/chat.contract";

export class MockChatService implements IChatService {
  async sendMessage(
    content: string,
    _attachments?: Attachment[],
    _context?: Message[],
    _modelId?: string,
  ): Promise<Message> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockResponse = this.generateMockResponse(content);
    return Message.create("assistant", mockResponse);
  }

  async streamMessage(
    content: string,
    _attachments: Attachment[] | undefined,
    _context: Message[],
    onChunk: (chunk: string) => void,
    _modelId?: string,
  ): Promise<Message> {
    const response = this.generateMockResponse(content);

    // Simulate streaming by sending chunks
    for (let i = 0; i < response.length; i += 10) {
      const chunk = response.slice(i, i + 10);
      onChunk(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return Message.create("assistant", response);
  }

  private generateMockResponse(userMessage: string): string {
    return `This is a **mock response** to your message: "${userMessage}"\n\nIn production, this would be replaced with an actual AI service adapter (OpenAI, Anthropic, etc.).\n\n**Features demonstrated:**\n- Markdown support\n- Code blocks\n- Lists\n\nExample code:\n\`\`\`typescript\nconst greeting = "Hello from the adapter!";\nconsole.log(greeting);\n\`\`\``;
  }
}
