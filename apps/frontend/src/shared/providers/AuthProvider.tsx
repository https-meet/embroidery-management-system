import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setupAuthInterceptors } from '@/shared/api';
import { queryClient } from '@/shared/lib/queryClient';
import { getCurrentUserApi, loginApi, logoutApi, refreshTokenApi } from '@/features/auth/api/auth.api';
import type { AuthUser, LoginDto } from '@/features/auth/types/auth.types';

const REFRESH_TOKEN_KEY = 'ebms_refresh_token';
const ACCESS_TOKEN_KEY = 'ebms_access_token';
const USER_CACHE_KEY = 'ebms_user_cache';

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Synchronously restore state from localStorage on initial render
  const initialAccessToken = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const initialUser = typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem(USER_CACHE_KEY);
          return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch {
          return null;
        }
      })()
    : null;

  const [user, setUserState] = useState<AuthUser | null>(initialUser);
  const [accessToken, setAccessTokenState] = useState<string | null>(initialAccessToken);
  const [isLoading, setIsLoading] = useState<boolean>(!initialAccessToken);
  const accessTokenRef = useRef<string | null>(initialAccessToken);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, []);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const logout = useCallback(() => {
    logoutApi().catch(() => {});

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    accessTokenRef.current = null;
    setAccessTokenState(null);
    setUserState(null);
    queryClient.clear();
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!savedRefreshToken) {
      return null;
    }

    try {
      const tokens = await refreshTokenApi(savedRefreshToken);
      setAccessToken(tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      if (!user) {
        const profileData = await getCurrentUserApi();
        setUser(profileData.user);
      }

      return tokens.accessToken;
    } catch {
      logout();
      return null;
    }
  }, [user, setAccessToken, setUser, logout]);

  const login = useCallback(
    async (dto: LoginDto): Promise<void> => {
      const data = await loginApi(dto);
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
      setUser(data.user);
    },
    [setAccessToken, setUser]
  );

  useEffect(() => {
    setupAuthInterceptors({
      getAccessToken,
      onRefreshToken: async () => {
        const newToken = await refreshSession();
        return newToken;
      },
      onUnauthorized: () => {
        logout();
      },
    });
  }, [getAccessToken, refreshSession, logout]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (savedRefreshToken) {
        try {
          const tokens = await refreshTokenApi(savedRefreshToken);
          if (isMounted) {
            setAccessToken(tokens.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

            const profileData = await getCurrentUserApi();
            if (isMounted) {
              setUser(profileData.user);
            }
          }
        } catch {
          if (isMounted) {
            logout();
          }
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setAccessToken, setUser, logout]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login,
      logout,
      refreshSession,
    }),
    [user, accessToken, isLoading, login, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
