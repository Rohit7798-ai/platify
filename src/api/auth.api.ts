// ──────────────────────────────────────────────
// Auth API — replaces direct Supabase auth calls
// ──────────────────────────────────────────────

import { apiClient, extractData } from './client';

interface AuthResponse {
  user: {
    name: string;
    email: string;
    image: string | null;
    joinedDate: string;
    level: number;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  supabaseSession?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = extractData<AuthResponse>(res);

    // Store tokens
    localStorage.setItem('plantify_access_token', data.tokens.accessToken);
    localStorage.setItem('plantify_refresh_token', data.tokens.refreshToken);

    return data;
  },

  async register(email: string, password: string, fullName: string) {
    const res = await apiClient.post('/auth/register', { email, password, fullName });
    return extractData(res);
  },

  async resetPassword(email: string) {
    const res = await apiClient.post('/auth/reset-password', {
      email,
      redirectUrl: window.location.origin,
    });
    return extractData(res);
  },

  async updatePassword(password: string) {
    const res = await apiClient.put('/auth/update-password', { password });
    return extractData(res);
  },

  logout() {
    localStorage.removeItem('plantify_access_token');
    localStorage.removeItem('plantify_refresh_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('plantify_access_token');
  },
};
