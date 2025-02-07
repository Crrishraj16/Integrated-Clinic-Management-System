import { ERROR_MESSAGES } from '../constants';

interface ErrorResponse {
  status?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

export const handleApiError = async (error: any): Promise<never> => {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error.response) {
    const errorData: ErrorResponse = await error.response.json();
    throw new ApiError(
      error.response.status,
      errorData.message || getDefaultErrorMessage(error.response.status),
      errorData.errors
    );
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
  }

  throw new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
};

export const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.BAD_REQUEST;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 500:
    default:
      return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  }
};

export const getValidationErrors = (error: any): Record<string, string> => {
  if (error instanceof ApiError && error.errors) {
    return Object.entries(error.errors).reduce((acc, [field, messages]) => {
      acc[field] = messages[0];
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
};

export const formatErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
};

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError &&
    error.message === 'Failed to fetch'
  );
};

export const isAuthenticationError = (error: any): boolean => {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  );
};

export const logError = (error: any, context?: string): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      `Error${context ? ` in ${context}` : ''}:`,
      error instanceof Error ? error.message : error
    );
  }
  
  // Here you could add error logging service integration
  // e.g., Sentry, LogRocket, etc.
};
