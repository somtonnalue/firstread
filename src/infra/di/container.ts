/**
 * Dependency Injection Container
 * Composition root - wires up all dependencies
 */

import { InMemoryChatRepository } from "@/adapters/InMemoryChatRepository";
import { MockChatService } from "@/adapters/MockChatService";
import { ManageChatThreadUseCase } from "@/application/usecases/ManageChatThreadUseCase";
import { SendMessageUseCase } from "@/application/usecases/SendMessageUseCase";
import { StreamMessageUseCase } from "@/application/usecases/StreamMessageUseCase";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";

/**
 * Application container - manages dependencies
 * Follows dependency injection principle
 */
export class Container {
  private static instance: Container;

  private _chatService: IChatService;
  private _chatRepository: IChatRepository;
  private _sendMessageUseCase: SendMessageUseCase;
  private _streamMessageUseCase: StreamMessageUseCase;
  private _manageChatThreadUseCase: ManageChatThreadUseCase;

  private constructor() {
    // Initialize adapters
    this._chatService = new MockChatService();
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

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get chatService(): IChatService {
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
   * Replace the chat service adapter
   * Useful for switching between Mock, OpenAI, Anthropic, etc.
   */
  setChatService(service: IChatService): void {
    this._chatService = service;
    this._sendMessageUseCase = new SendMessageUseCase(
      this._chatService,
      this._chatRepository,
    );
    this._streamMessageUseCase = new StreamMessageUseCase(
      this._chatService,
      this._chatRepository,
    );
  }

  /**
   * Replace the repository adapter
   * Useful for switching between InMemory, LocalStorage, Database, etc.
   */
  setChatRepository(repository: IChatRepository): void {
    this._chatRepository = repository;
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
}

// Export singleton instance
export const container = Container.getInstance();
