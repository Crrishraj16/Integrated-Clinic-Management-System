
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="error" sx={{ mb: 2 }}>
          403
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to access this page.
          Please contact your administrator if you believe this is a mistake.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ minWidth: 150 }}
          >
            Go Back
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ minWidth: 150 }}
          >
            Homepage
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
