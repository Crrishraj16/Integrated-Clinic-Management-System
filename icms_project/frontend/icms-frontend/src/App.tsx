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

// Patient Management
import PatientList from './pages/patients/PatientList';
import PatientRegistration from './pages/patients/PatientRegistration';
import PatientDetails from './pages/patients/PatientDetails';
import PatientMedicalHistory from './pages/patients/PatientMedicalHistory';

// Appointment Management
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm';

// Clinical Management
import PrescriptionList from './pages/clinical/PrescriptionList';
import PrescriptionForm from './pages/clinical/PrescriptionForm';
import LabOrderList from './pages/clinical/LabOrderList';
import LabOrderForm from './pages/clinical/LabOrderForm';
import LabResults from './pages/clinical/LabResults';
import VaccinationList from './pages/clinical/VaccinationList';
import VaccinationForm from './pages/clinical/VaccinationForm';

// Billing Management
import InvoiceList from './pages/billing/InvoiceList';
import InvoiceForm from './pages/billing/InvoiceForm';
import PaymentForm from './pages/billing/PaymentForm';
import ClaimsList from './pages/billing/ClaimsList';
import ClaimsForm from './pages/billing/ClaimsForm';

// Disease Database
import DiseaseList from './pages/disease/DiseaseList';
import DiseaseForm from './pages/disease/DiseaseForm';
import DiseaseDetails from './pages/disease/DiseaseDetails';

// Chat Support
import ChatList from './pages/chat/ChatList';

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
                        
                        {/* Patient Management Routes */}
                        <Route path="/patients" element={<PatientList />} />
                        <Route path="/patients/register" element={<PatientRegistration />} />
                        <Route path="/patients/:id" element={<PatientDetails />} />
                        <Route path="/patients/:id/edit" element={<PatientRegistration />} />
                        <Route path="/patients/:id/medical-history" element={<PatientMedicalHistory />} />
                        
                        {/* Appointment Management Routes */}
                        <Route path="/appointments" element={<AppointmentList />} />
                        <Route path="/appointments/new" element={<AppointmentForm />} />
                        <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
                        <Route path="/appointments/waiting" element={<div>Waiting List</div>} />
                        <Route path="/appointments/resources" element={<div>Resource Allocation</div>} />
                        
                        {/* Clinical Management Routes */}
                        <Route path="/clinical/prescriptions" element={<PrescriptionList />} />
                        <Route path="/clinical/prescriptions/new" element={<PrescriptionForm />} />
                        <Route path="/clinical/prescriptions/:id/edit" element={<PrescriptionForm />} />
                        <Route path="/clinical/lab" element={<LabOrderList />} />
                        <Route path="/clinical/lab/new" element={<LabOrderForm />} />
                        <Route path="/clinical/lab/:id/edit" element={<LabOrderForm />} />
                        <Route path="/clinical/lab/:id/results" element={<LabResults />} />
                        <Route path="/clinical/vaccinations" element={<VaccinationList />} />
                        <Route path="/clinical/vaccinations/new" element={<VaccinationForm />} />
                        <Route path="/clinical/vaccinations/:id/edit" element={<VaccinationForm />} />
                        
                        {/* Billing Management Routes */}
                        <Route path="/billing/invoices" element={<InvoiceList />} />
                        <Route path="/billing/invoices/new" element={<InvoiceForm />} />
                        <Route path="/billing/invoices/:id/edit" element={<InvoiceForm />} />
                        <Route path="/billing/invoices/:id/payment" element={<PaymentForm />} />
                        <Route path="/billing/claims" element={<ClaimsList />} />
                        <Route path="/billing/claims/new" element={<ClaimsForm />} />
                        <Route path="/billing/claims/:id/edit" element={<ClaimsForm />} />
                        <Route path="/billing/claims/:id/payment" element={<PaymentForm />} />
                        <Route path="/billing/claims" element={<div>Insurance Claims</div>} />
                        
                        {/* Disease Database Routes */}
                        <Route path="/disease" element={<DiseaseList />} />
                        <Route path="/disease/new" element={<DiseaseForm />} />
                        <Route path="/disease/:id" element={<DiseaseDetails />} />
                        <Route path="/disease/:id/edit" element={<DiseaseForm />} />
                        
                        {/* Chat Support Routes */}
                        <Route path="/chat" element={<ChatList />} />
                        
                        {/* Other Routes */}
                        <Route path="/inventory" element={<div>Inventory Management</div>} />
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
