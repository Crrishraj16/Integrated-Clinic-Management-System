import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LoadingProvider } from '../contexts/LoadingContext';

interface WrapperProps {
  children: React.ReactNode;
  initialRoute?: string;
}

function Wrapper({ children, initialRoute = '/' }: WrapperProps) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function render(ui: React.ReactElement, { route = '/', ...options } = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <Wrapper initialRoute={route}>{children}</Wrapper>,
    ...options,
  });
}

// Mock API response
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

// Mock error response
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
  return Promise.reject({
    status,
    message,
  });
};

// Mock local storage
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

// Re-export everything
export * from '@testing-library/react';
export { render };
