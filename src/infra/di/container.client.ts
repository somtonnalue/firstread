/**
 * Client-side Dependency Injection Container
 * Uses API adapter for frontend
 */

import { ApiChatService } from "@/adapters/ApiChatService";
import { InMemoryChatRepository } from "@/adapters/InMemoryChatRepository";
import { ManageChatThreadUseCase } from "@/application/usecases/ManageChatThreadUseCase";
import { SendMessageUseCase } from "@/application/usecases/SendMessageUseCase";
import { StreamMessageUseCase } from "@/application/usecases/StreamMessageUseCase";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";

/**
 * Client-side container - manages dependencies for frontend
 * Uses API adapter to call backend
 */
export class ClientContainer {
  private static instance: ClientContainer;

  private _chatService: ApiChatService;
  private _chatRepository: IChatRepository;
  private _sendMessageUseCase: SendMessageUseCase;
  private _streamMessageUseCase: StreamMessageUseCase;
  private _manageChatThreadUseCase: ManageChatThreadUseCase;

  private constructor() {
    // Initialize adapters
    // Frontend uses API adapter to call backend
    this._chatService = new ApiChatService();
    this._chatRepository = new InMemoryChatRepository();

    // Initialize use cases with dependencies
    this._sendMessageUseCase = new SendMessageUseCase(
      this._chatService,
      this._chatRepository,
    );

    this._streamMessageUseCase = new StreamMessageUseCase(
      this._chatService,
      this._chatRepository,
    );

    this._manageChatThreadUseCase = new ManageChatThreadUseCase(
      this._chatRepository,
    );
  }

  static getInstance(): ClientContainer {
    if (!ClientContainer.instance) {
      ClientContainer.instance = new ClientContainer();
    }
    return ClientContainer.instance;
  }

  get chatService(): ApiChatService {
    return this._chatService;
  }

  get chatRepository(): IChatRepository {
    return this._chatRepository;
  }

  get sendMessageUseCase(): SendMessageUseCase {
    return this._sendMessageUseCase;
  }

  get streamMessageUseCase(): StreamMessageUseCase {
    return this._streamMessageUseCase;
  }

  get manageChatThreadUseCase(): ManageChatThreadUseCase {
    return this._manageChatThreadUseCase;
  }

  /**
   * Abort ongoing streaming request
   */
  abortStreaming(): void {
    this._chatService.abort();
  }
}

// Export singleton instance
export const clientContainer = ClientContainer.getInstance();
