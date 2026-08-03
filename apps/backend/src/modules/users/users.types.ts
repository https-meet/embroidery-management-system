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

export interface UserQueryFilter {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
}

export interface CreateUserResponseDto {
  user: UserResponseDto;
  temporaryPassword: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: Role;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
}

export interface ResetUserPasswordResponseDto {
  temporaryPassword: string;
}
