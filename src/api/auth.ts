import { apiClient } from './client';
import type { AuthSession, LoginCredentials, AuthUser } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    const { data } = await apiClient.post<AuthSession>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: AuthUser }> => {
    const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return data;
  }
};
