/**
 * Create User Use Case - Application Layer
 * Handles user creation
 */

import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { User } from "@/domain/entities/User";

export interface CreateUserRequest {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface CreateUserResponse {
  user: User;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const user = User.create({
      id: request.id,
      name: request.name,
      email: request.email,
      image: request.image,
      approved: false, // New users are not approved by default
    });

    const createdUser = await this.userRepository.create(user);
    return { user: createdUser };
  }
}
