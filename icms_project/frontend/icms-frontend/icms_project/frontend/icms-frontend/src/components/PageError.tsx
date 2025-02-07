import { Box, Button, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function PageError({
  message = 'An error occurred while loading the page',
  onRetry,
}: PageErrorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
        p: 3,
      }}
    >
      <ErrorIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="h6" align="center" gutterBottom>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" color="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
