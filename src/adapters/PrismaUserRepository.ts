/**
 * Prisma User Repository - Adapter Layer
 * Implements user persistence using Prisma
 */

import { prisma } from "@/infra/database/prisma";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { User } from "@/domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    return new User({
      id: userData.id,
      name: userData.name ?? undefined,
      email: userData.email,
      emailVerified: userData.emailVerified ?? undefined,
      image: userData.image ?? undefined,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { email },
    });

    if (!userData) return null;

    return new User({
      id: userData.id,
      name: userData.name ?? undefined,
      email: userData.email,
      emailVerified: userData.emailVerified ?? undefined,
      image: userData.image ?? undefined,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async create(user: User): Promise<User> {
    const userData = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return new User({
      id: userData.id,
      name: userData.name ?? undefined,
      email: userData.email,
      emailVerified: userData.emailVerified ?? undefined,
      image: userData.image ?? undefined,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async update(user: User): Promise<User> {
    const userData = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        updatedAt: user.updatedAt,
      },
    });

    return new User({
      id: userData.id,
      name: userData.name ?? undefined,
      email: userData.email,
      emailVerified: userData.emailVerified ?? undefined,
      image: userData.image ?? undefined,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
