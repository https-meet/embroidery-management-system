import crypto from 'crypto';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../utils/errors';
import { authRepository, type AuthRepository } from './auth.repository';
import type {
  AuthTokensDto,
  ChangePasswordDto,
  CreateUserFoundationDto,
  CreatedUserFoundationResult,
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  UserResponseDto,
} from './auth.types';
import { jwtService } from './jwt.service';
import { passwordService } from './password.service';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  /**
   * Admin User Creation Foundation (Milestone 3.1 - Sprint 1)
   * Generates a cryptographically secure random temporary password,
   * hashes it, sets mustChangePassword = true, and records creator admin ID.
   * Returns temporary password ONLY to caller.
   */
  public async createUserFoundation(
    dto: CreateUserFoundationDto,
  ): Promise<CreatedUserFoundationResult> {
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
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
      mustChangePassword: true,
      createdBy: dto.createdByAdminId,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
        createdBy: user.createdBy,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      temporaryPassword,
    };
  }

  public async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('USER_INACTIVE', 'User account is inactive.');
    }

    const isValidPassword = await passwordService.verify(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // Update lastLoginAt timestamp upon successful authentication
    await this.repo.updateLastLoginAt(user.id);

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = jwtService.generateAccessToken(userPayload);
    const refreshToken = jwtService.generateRefreshToken(userPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('UNAUTHORIZED', 'User account is inactive or not found.');
    }

    const isValidPassword = await passwordService.verify(dto.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError('INVALID_CURRENT_PASSWORD', 'Current password is incorrect.');
    }

    const validation = passwordService.validate(dto.newPassword);
    if (!validation.isValid) {
      throw new BadRequestError('PASSWORD_POLICY_VIOLATION', validation.errors.join(' '));
    }

    const newPasswordHash = await passwordService.hash(dto.newPassword);
    await this.repo.updatePassword(userId, newPasswordHash, false);
  }

  public async refreshToken(dto: RefreshTokenDto): Promise<AuthTokensDto> {
    const payload = jwtService.verifyRefreshToken(dto.refreshToken);
    if (!payload) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.');
    }

    const user = await this.repo.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError(
        'INVALID_REFRESH_TOKEN',
        'User associated with refresh token is inactive or not found.',
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = jwtService.generateAccessToken(userPayload);
    const newRefreshToken = jwtService.generateRefreshToken(userPayload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('UNAUTHORIZED', 'User account is inactive or not found.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      createdBy: user.createdBy,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async logout(_dto?: RefreshTokenDto): Promise<void> {
    return Promise.resolve();
  }
}

export const authService = new AuthService();
