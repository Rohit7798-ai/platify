// ──────────────────────────────────────────────
// Auth Store — lightweight state management
// Replaced direct Supabase auth with Backend API
// ──────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  joinedDate: string;
  level: number;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Flora Explorer',
  email: 'explorer@plantify.ai',
  image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  joinedDate: 'May 2026',
  level: 5,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('plantify_user');
      const token = localStorage.getItem('plantify_access_token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('plantify_user');
          localStorage.removeItem('plantify_access_token');
          localStorage.removeItem('plantify_refresh_token');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      const userProfile: UserProfile = {
        id: (response.user as any).id || '00000000-0000-0000-0000-000000000000',
        name: response.user.name,
        email: response.user.email,
        image: response.user.image,
        joinedDate: response.user.joinedDate,
        level: response.user.level || 1,
      };
      setUser(userProfile);
      localStorage.setItem('plantify_user', JSON.stringify(userProfile));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      await authApi.register(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      authApi.logout();
      setUser(null);
      localStorage.removeItem('plantify_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    setIsLoading(true);
    try {
      await authApi.updatePassword(password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}