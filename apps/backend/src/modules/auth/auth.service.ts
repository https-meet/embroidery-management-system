import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../../utils/errors';
import { authRepository, type AuthRepository } from './auth.repository';
import type {
  AuthTokensDto,
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RegisterDto,
  UserResponseDto,
} from './auth.types';
import { jwtService } from './jwt.service';
import { passwordService } from './password.service';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  public async register(dto: RegisterDto): Promise<UserResponseDto> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(
        'EMAIL_ALREADY_EXISTS',
        'A user with this email address already exists.',
      );
    }

    const validation = passwordService.validate(dto.password);
    if (!validation.isValid) {
      throw new BadRequestError('PASSWORD_POLICY_VIOLATION', validation.errors.join(' '));
    }

    const passwordHash = await passwordService.hash(dto.password);

    const user = await this.repo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtService.generateAccessToken(userPayload);
    const refreshToken = jwtService.generateRefreshToken(userPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
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
    };

    const accessToken = jwtService.generateAccessToken(userPayload);
    const newRefreshToken = jwtService.generateRefreshToken(userPayload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logout(_dto?: RefreshTokenDto): Promise<void> {
    return Promise.resolve();
  }
}

export const authService = new AuthService();
