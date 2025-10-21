/**
 * Get User Use Case - Application Layer
 * Handles retrieving user information
 */

import type { IUserRepository } from "@/domain/ports/IUserRepository";
import type { User } from "@/domain/entities/User";

export interface GetUserRequest {
  userId: string;
}

export interface GetUserResponse {
  user: User | null;
}

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userRepository.findById(request.userId);
    return { user };
  }
}
