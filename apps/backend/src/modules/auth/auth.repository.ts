import type { PrismaClient, Role, User } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
  mustChangePassword?: boolean;
  createdBy?: string;
}

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
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
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: timestamp },
    });
  }

  public async updatePassword(
    id: string,
    passwordHash: string,
    mustChangePassword: boolean = false,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword,
      },
    });
  }
}

export const authRepository = new AuthRepository();
