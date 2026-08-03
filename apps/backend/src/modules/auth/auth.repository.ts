import type { Role, User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
  mustChangePassword?: boolean;
  createdBy?: string;
}

export class AuthRepository {
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role ?? 'OPERATOR',
        mustChangePassword: data.mustChangePassword ?? false,
        createdBy: data.createdBy ?? null,
      },
    });
  }

  public async updateLastLoginAt(id: string, timestamp: Date = new Date()): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: timestamp },
    });
  }

  public async updatePassword(
    id: string,
    passwordHash: string,
    mustChangePassword: boolean = false,
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword,
      },
    });
  }
}

export const authRepository = new AuthRepository();
