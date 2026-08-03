import crypto from 'crypto';
import type { AccessTokenPayload } from '../auth/jwt.service';
import { passwordService } from '../auth/password.service';
import { settingsService } from '../settings/settings.service';
import { AppError, BadRequestError } from '../../utils/errors';
import { userRepository, type UserRepository } from './users.repository';
import type {
  CreateUserDto,
  CreateUserResponseDto,
  PaginatedUsersResponseDto,
  ResetUserPasswordResponseDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserQueryFilter,
  UserResponseDto,
} from './users.types';

export class UserService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  private mapToDto(user: {
    id: string;
    name: string;
    email: string;
    role: any;
    isActive: boolean;
    mustChangePassword: boolean;
    lastLoginAt?: Date | null;
    createdBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async listUsers(filter: UserQueryFilter): Promise<PaginatedUsersResponseDto> {
    const page = Number(filter.page) > 0 ? Number(filter.page) : 1;
    const limit = Number(filter.limit) > 0 ? Number(filter.limit) : 20;

    const { users, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: users.map((u) => this.mapToDto(u)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User account not found.', 404);
    }
    return this.mapToDto(user);
  }

  public async createUser(
    dto: CreateUserDto,
    adminUser: AccessTokenPayload,
  ): Promise<CreateUserResponseDto> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestError(
        'EMAIL_ALREADY_EXISTS',
        'A user with this email address already exists.',
      );
    }

    // Generate a cryptographically secure random temporary password satisfying password policy
    const randomBuffer = crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const temporaryPassword = `Tmp@${randomBuffer}2026!`;

    const validation = passwordService.validate(temporaryPassword);
    if (!validation.isValid) {
      throw new BadRequestError('PASSWORD_POLICY_VIOLATION', validation.errors.join(' '));
    }

    const passwordHash = await passwordService.hash(temporaryPassword);

    const user = await this.repo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      createdBy: adminUser.userId,
      mustChangePassword: true,
    });

    // Record audit event
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      newValue: JSON.stringify({ email: user.email, role: user.role }),
    });

    return {
      user: this.mapToDto(user),
      temporaryPassword,
    };
  }

  public async updateUser(
    id: string,
    dto: UpdateUserDto,
    adminUser: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('USER_NOT_FOUND', 'User account not found.', 404);
    }

    if (dto.email && dto.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailConflict = await this.repo.findByEmail(dto.email);
      if (emailConflict) {
        throw new BadRequestError(
          'EMAIL_ALREADY_EXISTS',
          'A user with this email address already exists.',
        );
      }
    }

    if (id === adminUser.userId && dto.role && dto.role !== existing.role) {
      throw new BadRequestError(
        'CANNOT_CHANGE_OWN_ROLE',
        'Administrators cannot modify their own system role.',
      );
    }

    const updated = await this.repo.update(id, dto);

    // Record audit event
    const action = dto.role && dto.role !== existing.role ? 'ROLE_CHANGED' : 'USER_UPDATED';
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action,
      entityType: 'USER',
      entityId: updated.id,
      previousValue: JSON.stringify({ name: existing.name, email: existing.email, role: existing.role }),
      newValue: JSON.stringify({ name: updated.name, email: updated.email, role: updated.role }),
    });

    return this.mapToDto(updated);
  }

  public async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    adminUser: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('USER_NOT_FOUND', 'User account not found.', 404);
    }

    // Business Rule 1: Administrators cannot deactivate their own account
    if (id === adminUser.userId && !dto.isActive) {
      throw new BadRequestError(
        'CANNOT_DEACTIVATE_SELF',
        'Administrators cannot deactivate their own account.',
      );
    }

    // Business Rule 2: Cannot deactivate the system's last active Administrator account
    if (existing.role === 'ADMIN' && existing.isActive && !dto.isActive) {
      const activeAdminCount = await this.repo.countActiveAdmins();
      if (activeAdminCount <= 1) {
        throw new BadRequestError(
          'LAST_ADMIN_DEACTIVATION',
          "Cannot deactivate the system's last active Administrator account.",
        );
      }
    }

    const updated = await this.repo.updateStatus(id, dto.isActive);

    // Record audit event
    const action = dto.isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED';
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action,
      entityType: 'USER',
      entityId: updated.id,
      previousValue: JSON.stringify({ isActive: existing.isActive }),
      newValue: JSON.stringify({ isActive: updated.isActive }),
    });

    return this.mapToDto(updated);
  }

  public async resetUserPassword(
    id: string,
    adminUser: AccessTokenPayload,
  ): Promise<ResetUserPasswordResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('USER_NOT_FOUND', 'User account not found.', 404);
    }

    // Generate a new cryptographically secure random temporary password
    const randomBuffer = crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const temporaryPassword = `Tmp@${randomBuffer}2026!`;

    const validation = passwordService.validate(temporaryPassword);
    if (!validation.isValid) {
      throw new BadRequestError('PASSWORD_POLICY_VIOLATION', validation.errors.join(' '));
    }

    const passwordHash = await passwordService.hash(temporaryPassword);
    await this.repo.updatePassword(id, passwordHash, true);

    // Record audit event
    await settingsService.logAuditAction({
      userId: adminUser.userId,
      userName: adminUser.email,
      action: 'PASSWORD_RESET',
      entityType: 'USER',
      entityId: existing.id,
      reason: 'Administrator triggered password reset',
    });

    return {
      temporaryPassword,
    };
  }
}

export const userService = new UserService();
