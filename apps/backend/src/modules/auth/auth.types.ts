import type { Role } from '@prisma/client';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
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
  };
  tokens: AuthTokensDto;
}
