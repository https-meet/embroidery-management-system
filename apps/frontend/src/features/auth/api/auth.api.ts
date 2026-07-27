import { axiosClient } from '@/shared/api';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import type {
  AuthTokensDto,
  LoginDto,
  LoginResponseData,
  UserProfileResponseData,
} from '../types/auth.types';

/**
 * Authentication API Service Functions
 */
export async function loginApi(dto: LoginDto): Promise<LoginResponseData> {
  const response = (await axiosClient.post('/auth/login', dto)) as unknown as ApiSuccessResponse<LoginResponseData>;
  return response.data;
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthTokensDto> {
  const response = (await axiosClient.post('/auth/refresh', {
    refreshToken,
  })) as unknown as ApiSuccessResponse<AuthTokensDto>;
  return response.data;
}

export async function getCurrentUserApi(): Promise<UserProfileResponseData> {
  const response = (await axiosClient.get('/auth/me')) as unknown as ApiSuccessResponse<UserProfileResponseData>;
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await axiosClient.post('/auth/logout');
}
