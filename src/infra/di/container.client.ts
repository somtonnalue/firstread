/**
 * Client-side Dependency Injection Container
 * Uses API adapter for frontend
 * 
 * NOTE: Client container should NOT contain use cases.
 * Use cases run on the server only. Client only calls APIs.
 */

import { ApiChatService } from "@/adapters/ApiChatService";
import { ApiChatRepository } from "@/adapters/ApiChatRepository";
import { ManageChatThreadUseCase } from "@/application/usecases/ManageChatThreadUseCase";
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
  private _manageChatThreadUseCase: ManageChatThreadUseCase;

  private constructor() {
    // Initialize adapters
    // Frontend uses API adapter to call backend
    this._chatService = new ApiChatService();
    this._chatRepository = new ApiChatRepository();

    // Only thread management use case - for reading/managing existing threads
    // Sending messages is handled by server-side use cases
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
