import type { UserRole } from '@/shared/constants/business';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthUser;
  tokens: AuthTokensDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UserProfileResponseData {
  user: AuthUser;
}
