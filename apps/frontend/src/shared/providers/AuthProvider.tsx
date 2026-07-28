import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setupAuthInterceptors } from '@/shared/api';
import { queryClient } from '@/shared/lib/queryClient';
import { getCurrentUserApi, loginApi, logoutApi, refreshTokenApi } from '@/features/auth/api/auth.api';
import type { AuthUser, LoginDto } from '@/features/auth/types/auth.types';

const REFRESH_TOKEN_KEY = 'ebms_refresh_token';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const accessTokenRef = useRef<string | null>(null);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const logout = useCallback(() => {
    logoutApi().catch(() => {});

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [setAccessToken]);

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
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [user, setAccessToken]);

  const login = useCallback(
    async (dto: LoginDto): Promise<void> => {
      const data = await loginApi(dto);
      setAccessToken(data.tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
      setUser(data.user);
    },
    [setAccessToken]
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
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            setAccessToken(null);
            setUser(null);
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
  }, [setAccessToken]);

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
