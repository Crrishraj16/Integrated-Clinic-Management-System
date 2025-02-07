import { Alert } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
}

const ErrorAlert = ({ message, severity = 'error', onClose }: ErrorAlertProps) => {
  return (
    <Alert severity={severity} onClose={onClose}>
      {message}
    </Alert>
  );
};

export default ErrorAlert;
