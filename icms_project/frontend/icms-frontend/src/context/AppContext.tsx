import React, { createContext, useState, useContext, ReactNode, useMemo, useReducer } from 'react';
import { User } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['notifications'][0], 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'light',
  notifications: [],
};

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => null,
  user: null,
  setUser: () => null,
  isAuthenticated: false,
});

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Math.random().toString(36).substring(7),
            ...action.payload,
          },
        ],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const user = state.user;
  const setUser = (user: User | null) => dispatch({ type: 'SET_USER', payload: user });
  const isAuthenticated = useMemo(() => !!user, [user]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      user,
      setUser,
      isAuthenticated,
    }),
    [state, user, isAuthenticated]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAuth = () => {
  const { state, dispatch, user, setUser, isAuthenticated } = useApp();
  return {
    user,
    isAuthenticated,
    isLoading: state.isLoading,
    setUser,
    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };
};

export const useTheme = () => {
  const { state, dispatch } = useApp();
  return {
    theme: state.theme,
    setTheme: (theme: 'light' | 'dark') =>
      dispatch({ type: 'SET_THEME', payload: theme }),
  };
};

export const useNotifications = () => {
  const { state, dispatch } = useApp();
  return {
    notifications: state.notifications,
    addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
  };
};
