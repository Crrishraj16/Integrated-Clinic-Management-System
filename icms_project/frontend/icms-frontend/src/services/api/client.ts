import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../../config';
import { getStoredAuthToken, removeStoredAuthToken } from '../auth';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private client: AxiosInstance;
  private retryCount: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.url,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getStoredAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (!error.response) {
          throw new ApiError('Network error', 0);
        }

        const { status, data } = error.response;

        // Handle 401 Unauthorized
        if (status === 401) {
          removeStoredAuthToken();
          window.location.href = '/login';
          return Promise.reject(new ApiError('Session expired', status, data));
        }

        // Handle retry logic for 5xx errors
        if (status >= 500 && this.retryCount < config.api.retryAttempts) {
          this.retryCount++;
          return this.retryRequest(error.config as AxiosRequestConfig);
        }

        this.retryCount = 0;
        throw new ApiError(
          (data as any)?.message || 'An unexpected error occurred',
          status,
          data
        );
      }
    );
  }

  private async retryRequest(config: AxiosRequestConfig) {
    const backoffMs = Math.pow(2, this.retryCount) * 1000;
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
    return this.client(config);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
