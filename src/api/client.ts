// ──────────────────────────────────────────────
// API Client — centralized Axios instance
// ──────────────────────────────────────────────

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI calls
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT ─────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('plantify_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401, refresh token ─────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('plantify_refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const newTokens = data.data.tokens;

          localStorage.setItem('plantify_access_token', newTokens.accessToken);
          localStorage.setItem('plantify_refresh_token', newTokens.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }

          return apiClient(originalRequest);
        } catch {
          // Refresh failed — force logout
          localStorage.removeItem('plantify_access_token');
          localStorage.removeItem('plantify_refresh_token');
          localStorage.removeItem('plantify_user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Type-safe API response extractor ─────────
export function extractData<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
