import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" /> : <Register />}
              />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  isAuthenticated ? (
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/patients" element={<div>Patients List</div>} />
                        <Route path="/patients/register" element={<div>Patient Registration</div>} />
                        <Route path="/patients/insurance" element={<div>Insurance Info</div>} />
                        <Route path="/appointments" element={<div>Appointments</div>} />
                        <Route path="/appointments/waiting" element={<div>Waiting List</div>} />
                        <Route path="/appointments/resources" element={<div>Resource Allocation</div>} />
                        <Route path="/clinical/lab" element={<div>Lab Orders</div>} />
                        <Route path="/clinical/prescriptions" element={<div>Prescriptions</div>} />
                        <Route path="/clinical/vaccinations" element={<div>Vaccinations</div>} />
                        <Route path="/billing/invoices" element={<div>Invoices</div>} />
                        <Route path="/billing/claims" element={<div>Insurance Claims</div>} />
                        <Route path="/billing/payments" element={<div>Payments</div>} />
                        <Route path="/reports" element={<div>Reports</div>} />
                        <Route path="/inventory" element={<div>Inventory</div>} />
                        <Route path="/diseases" element={<div>Disease Database</div>} />
                        <Route path="/chat" element={<div>Chat Assistant</div>} />
                        <Route path="/settings" element={<div>Settings</div>} />
                        <Route path="/profile" element={<div>Profile</div>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MainLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
