import type { Role } from '@prisma/client';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    mustChangePassword: boolean;
  };
  tokens: AuthTokensDto;
}

export interface CreateUserFoundationDto {
  name: string;
  email: string;
  role?: Role;
  createdByAdminId: string;
}

export interface CreatedUserFoundationResult {
  user: UserResponseDto;
  temporaryPassword: string;
}
