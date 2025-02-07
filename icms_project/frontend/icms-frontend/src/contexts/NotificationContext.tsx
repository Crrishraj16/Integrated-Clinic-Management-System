import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AUTO_DISMISS_DURATION } from '../constants';

type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

interface Notification {
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Notification) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(({ message, severity, autoHideDuration }: Notification) => {
    setNotification({
      message,
      severity,
      autoHideDuration: autoHideDuration || AUTO_DISMISS_DURATION,
    });
    setOpen(true);
  }, []);

  const hideNotification = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && (
        <Snackbar
          open={open}
          autoHideDuration={notification.autoHideDuration}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleClose}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}
