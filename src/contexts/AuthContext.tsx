import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import { authApi } from '@/api/auth';
import {
  TOKEN_STORAGE_KEY,
  EXPIRES_AT_STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  clearStoredSession,
} from '@/api/client';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_TIMEOUT_MS = 2_147_483_647;

function isStoredTokenExpired(): boolean {
  const rawExpiresAt = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
  if (!rawExpiresAt) return false;
  const expiresAt = Number(rawExpiresAt);
  return Number.isFinite(expiresAt) && expiresAt > 0 && Date.now() >= expiresAt * 1000;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token || isStoredTokenExpired()) {
        clearStoredSession();
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { user: userData } = await authApi.getMe();
        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        clearStoredSession();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Limpiar automáticamente la sesión cuando el accessToken alcance su fecha de expiración
  useEffect(() => {
    if (!user) return;
    const rawExpiresAt = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
    if (!rawExpiresAt) return;

    const expiresAt = Number(rawExpiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) return;

    const msUntilExpiry = expiresAt * 1000 - Date.now();
    const delay = Math.max(0, Math.min(msUntilExpiry, MAX_TIMEOUT_MS));

    const timeoutId = window.setTimeout(handleUnauthorized, delay);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user, handleUnauthorized]);

  const login = async (credentials: LoginCredentials) => {
    const session = await authApi.login(credentials);
    localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
    if (session.expiresAt > 0) {
      localStorage.setItem(EXPIRES_AT_STORAGE_KEY, String(session.expiresAt));
    } else {
      localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
    }
    setUser(session.user);
  };

  const logout = async () => {
    const hasToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
    try {
      if (hasToken) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearStoredSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
