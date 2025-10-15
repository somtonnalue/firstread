/**
 * Server-side Dependency Injection Container
 * Uses Gemini adapter for production
 */

import { GeminiChatService } from "@/adapters/GeminiChatService";
import { InMemoryChatRepository } from "@/adapters/InMemoryChatRepository";
import { MockChatService } from "@/adapters/MockChatService";
import { ManageChatThreadUseCase } from "@/application/usecases/ManageChatThreadUseCase";
import { SendMessageUseCase } from "@/application/usecases/SendMessageUseCase";
import { StreamMessageUseCase } from "@/application/usecases/StreamMessageUseCase";
import { env } from "@/infra/config/env";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";

/**
 * Server-side container - manages dependencies with Gemini
 */
export class ServerContainer {
  private static instance: ServerContainer;

  private _chatService: IChatService;
  private _chatRepository: IChatRepository;
  private _sendMessageUseCase: SendMessageUseCase;
  private _streamMessageUseCase: StreamMessageUseCase;
  private _manageChatThreadUseCase: ManageChatThreadUseCase;

  private constructor() {
    // Initialize adapters
    // Use Gemini if API key is available, otherwise fall back to Mock
    if (env.googleAI.apiKey) {
      this._chatService = new GeminiChatService(
        env.googleAI.apiKey,
        env.googleAI.model,
      );
      console.log("[ SUCCESS ] - Using Gemini Chat Service");
    } else {
      this._chatService = new MockChatService();
      console.warn(
        "[ WARNING ] - No GOOGLE_GENERATIVE_AI_API_KEY found, using Mock Chat Service",
      );
    }

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

  static getInstance(): ServerContainer {
    if (!ServerContainer.instance) {
      ServerContainer.instance = new ServerContainer();
    }
    return ServerContainer.instance;
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
}

// singleton instance
export const serverContainer = ServerContainer.getInstance();
