import config from '../config';
import { apiClient } from './api/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export const getStoredAuthToken = (): string | null => {
  return localStorage.getItem(config.security.tokenKey);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(config.security.refreshTokenKey);
};

export const setStoredAuthToken = (token: string): void => {
  localStorage.setItem(config.security.tokenKey, token);
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem(config.security.refreshTokenKey, token);
};

export const removeStoredAuthToken = (): void => {
  localStorage.removeItem(config.security.tokenKey);
};

export const removeStoredRefreshToken = (): void => {
  localStorage.removeItem(config.security.refreshTokenKey);
};

export const clearAuthTokens = (): void => {
  removeStoredAuthToken();
  removeStoredRefreshToken();
};

export const isAuthenticated = (): boolean => {
  const token = getStoredAuthToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const login = async (credentials: UserCredentials): Promise<void> => {
  const response = await apiClient.post<AuthTokens>('/auth/login', credentials);
  setStoredAuthToken(response.accessToken);
  setStoredRefreshToken(response.refreshToken);
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearAuthTokens();
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  });

  setStoredAuthToken(response.accessToken);
  setStoredRefreshToken(response.refreshToken);
  return response.accessToken;
};
