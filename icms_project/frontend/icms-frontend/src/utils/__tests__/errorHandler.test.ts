import { describe, it, expect, vi } from 'vitest';
import {
  handleApiError,
  getDefaultErrorMessage,
  getValidationErrors,
  formatErrorMessage,
  isNetworkError,
  isAuthenticationError,
  logError,
} from '../errorHandler';
import { ERROR_MESSAGES } from '../../constants';

describe('Error Handler', () => {
  describe('handleApiError', () => {
    it('handles API errors', async () => {
      const apiError = {
        response: {
          status: 400,
          json: () => Promise.resolve({
            message: 'Validation failed',
            errors: { field: ['Invalid value'] },
          }),
        },
      };

      await expect(handleApiError(apiError)).rejects.toMatchObject({
        status: 400,
        message: 'Validation failed',
        errors: { field: ['Invalid value'] },
      });
    });

    it('handles network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      await expect(handleApiError(networkError)).rejects.toMatchObject({
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    });

    it('handles unknown errors', async () => {
      const unknownError = new Error('Unknown error');
      await expect(handleApiError(unknownError)).rejects.toMatchObject({
        status: 500,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getDefaultErrorMessage', () => {
    it('returns correct messages for status codes', () => {
      expect(getDefaultErrorMessage(400)).toBe(ERROR_MESSAGES.BAD_REQUEST);
      expect(getDefaultErrorMessage(401)).toBe(ERROR_MESSAGES.UNAUTHORIZED);
      expect(getDefaultErrorMessage(403)).toBe(ERROR_MESSAGES.FORBIDDEN);
      expect(getDefaultErrorMessage(404)).toBe(ERROR_MESSAGES.NOT_FOUND);
      expect(getDefaultErrorMessage(500)).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    });

    it('returns internal server error for unknown status codes', () => {
      expect(getDefaultErrorMessage(418)).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getValidationErrors', () => {
    it('formats validation errors correctly', () => {
      const error = {
        errors: {
          email: ['Invalid email'],
          password: ['Too short', 'Must contain numbers'],
        },
      };

      const formatted = getValidationErrors(error);
      expect(formatted).toEqual({
        email: 'Invalid email',
        password: 'Too short',
      });
    });

    it('returns empty object for non-validation errors', () => {
      expect(getValidationErrors(new Error('Test'))).toEqual({});
    });
  });

  describe('formatErrorMessage', () => {
    it('formats API errors', () => {
      const error = {
        message: 'API Error',
        status: 400,
      };
      expect(formatErrorMessage(error)).toBe('API Error');
    });

    it('formats standard errors', () => {
      const error = new Error('Standard Error');
      expect(formatErrorMessage(error)).toBe('Standard Error');
    });

    it('handles unknown error types', () => {
      expect(formatErrorMessage({})).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    });
  });

  describe('isNetworkError', () => {
    it('identifies network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('identifies non-network errors', () => {
      expect(isNetworkError(new Error('Other error'))).toBe(false);
    });
  });

  describe('isAuthenticationError', () => {
    it('identifies authentication errors', () => {
      const error401 = { status: 401 };
      const error403 = { status: 403 };
      expect(isAuthenticationError(error401)).toBe(true);
      expect(isAuthenticationError(error403)).toBe(true);
    });

    it('identifies non-authentication errors', () => {
      const error400 = { status: 400 };
      expect(isAuthenticationError(error400)).toBe(false);
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('logs errors with context in development', () => {
      const error = new Error('Test Error');
      logError(error, 'TestComponent');
      expect(console.error).toHaveBeenCalledWith(
        'Error in TestComponent:',
        'Test Error'
      );
    });

    it('logs errors without context', () => {
      const error = new Error('Test Error');
      logError(error);
      expect(console.error).toHaveBeenCalledWith('Error:', 'Test Error');
    });
  });
});
