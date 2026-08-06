import type { Prisma, Role, User, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../lib/prisma';
import type { UserQueryFilter } from './users.types';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async countActiveAdmins(): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: 'ADMIN',
        isActive: true,
      },
    });
  }

  public async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdBy: string;
    mustChangePassword?: boolean;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        createdBy: data.createdBy,
        mustChangePassword: data.mustChangePassword ?? true,
        isActive: true,
      },
    });
  }

  public async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: Role;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.role && { role: data.role }),
      },
    });
  }

  public async updateStatus(id: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  public async updatePassword(
    id: string,
    passwordHash: string,
    mustChangePassword: boolean = true,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword,
      },
    });
  }

  public async findMany(
    filter: UserQueryFilter,
  ): Promise<{ users: User[]; total: number }> {
    const search = filter.search;
    const role = filter.role;
    const isActive = filter.isActive;
    const pageNum = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limitNum = Number(filter.limit) > 0 ? Number(filter.limit) : 20;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}

export const userRepository = new UserRepository();
