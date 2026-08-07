import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiBusinessError, ApiValidationError } from '../types/api.types';
import { axiosClient } from './axiosClient';

// Store references to auth handlers without circular dependency
let getAccessToken: (() => string | null) | null = null;
let onRefreshToken: (() => Promise<string | null>) | null = null;
let onUnauthorized: (() => void) | null = null;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Track interceptor IDs to prevent duplicate registrations (Issue 2 fix)
let reqInterceptorId: number | null = null;
let resInterceptorId: number | null = null;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Register authentication callbacks from AuthProvider
 */
export function setupAuthInterceptors(callbacks: {
  getAccessToken: () => string | null;
  onRefreshToken: () => Promise<string | null>;
  onUnauthorized: () => void;
}) {
  getAccessToken = callbacks.getAccessToken;
  onRefreshToken = callbacks.onRefreshToken;
  onUnauthorized = callbacks.onUnauthorized;
}

/**
 * Configure Axios Interceptors for Auth Injection & Error Normalization.
 * Safely ejects previous interceptors if re-run to prevent duplicate registration (Issue 2 fix).
 */
export function setupAxiosInterceptors() {
  if (reqInterceptorId !== null) {
    axiosClient.interceptors.request.eject(reqInterceptorId);
  }
  if (resInterceptorId !== null) {
    axiosClient.interceptors.response.eject(resInterceptorId);
  }

  // Request Interceptor: Attach Access Token
  reqInterceptorId = axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken ? getAccessToken() : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Unwrap Data & Handle 401 Token Refresh & Error Normalization
  resInterceptorId = axiosClient.interceptors.response.use(
    (response) => {
      return response.data;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      const url = originalRequest?.url || '';
      // Auth endpoints (/auth/login, /auth/refresh) must NEVER trigger silent token refresh loops
      const isNoRefreshAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');

      // If login or refresh endpoint itself returned 401, trigger unauthorized callback
      if (isNoRefreshAuthEndpoint && error.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      // Handle 401 Unauthorized & Silent Token Refresh (excluding auth endpoints)
      if (error.response?.status === 401 && !isNoRefreshAuthEndpoint && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          if (onRefreshToken) {
            const newToken = await onRefreshToken();
            if (newToken) {
              processQueue(null, newToken);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axiosClient(originalRequest);
            }
          }
          // Refresh failed or returned null token
          processQueue(error, null);
          if (onUnauthorized) {
            onUnauthorized();
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          if (onUnauthorized) {
            onUnauthorized();
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // Normalize Error Response
      const errorData = error.response?.data as ApiBusinessError | ApiValidationError | undefined;

      if (errorData) {
        return Promise.reject(errorData);
      }

      // Fallback for network / unknown errors
      const fallbackError: ApiBusinessError = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'An unexpected error occurred.',
        },
      };

      return Promise.reject(fallbackError);
    }
  );
}
