/**
 * Server-side Dependency Injection Container - Infrastructure Layer
 * Provides instances of server-side services and use cases
 */

import { PrismaUserRepository } from "@/adapters/PrismaUserRepository";
import { PrismaChatRepository } from "@/adapters/PrismaChatRepository";
import { GeminiChatService } from "@/adapters/GeminiChatService";
import { SendMessageUseCase } from "@/application/usecases/SendMessageUseCase";
import { StreamMessageUseCase } from "@/application/usecases/StreamMessageUseCase";
import { GetUserUseCase } from "@/usecases/GetUserUseCase";
import { CreateUserUseCase } from "@/usecases/CreateUserUseCase";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import type { IChatRepository } from "@/ports/IChatRepository";
import type { IChatService } from "@/ports/IChatService";

export class ServerContainer {
  private static instance: ServerContainer;
  private _userRepository: IUserRepository;
  private _chatRepository: IChatRepository;
  private _chatService: IChatService;
  private _sendMessageUseCase: SendMessageUseCase;
  private _streamMessageUseCase: StreamMessageUseCase;
  private _getUserUseCase: GetUserUseCase;
  private _createUserUseCase: CreateUserUseCase;

  private constructor() {
    // Initialize repositories
    this._userRepository = new PrismaUserRepository();
    this._chatRepository = new PrismaChatRepository();
    this._chatService = new GeminiChatService(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      "gemini-2.5-flash",
    );

    // Initialize use cases
    this._sendMessageUseCase = new SendMessageUseCase(
      this._chatService,
      this._chatRepository,
    );
    this._streamMessageUseCase = new StreamMessageUseCase(
      this._chatService,
      this._chatRepository,
    );
    this._getUserUseCase = new GetUserUseCase(this._userRepository);
    this._createUserUseCase = new CreateUserUseCase(this._userRepository);
  }

  public static getInstance(): ServerContainer {
    if (!ServerContainer.instance) {
      ServerContainer.instance = new ServerContainer();
    }
    return ServerContainer.instance;
  }

  // Getters
  get userRepository(): IUserRepository {
    return this._userRepository;
  }

  get chatRepository(): IChatRepository {
    return this._chatRepository;
  }

  get chatService(): IChatService {
    return this._chatService;
  }

  get sendMessageUseCase(): SendMessageUseCase {
    return this._sendMessageUseCase;
  }

  get streamMessageUseCase(): StreamMessageUseCase {
    return this._streamMessageUseCase;
  }

  get getUserUseCase(): GetUserUseCase {
    return this._getUserUseCase;
  }

  get createUserUseCase(): CreateUserUseCase {
    return this._createUserUseCase;
  }
}

export const serverContainer = ServerContainer.getInstance();
