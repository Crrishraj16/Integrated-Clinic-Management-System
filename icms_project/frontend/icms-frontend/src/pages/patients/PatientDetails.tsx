import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as PrescriptionIcon,
  Science as LabIcon,
  AttachMoney as BillingIcon,
} from '@mui/icons-material';
import type { Patient, Appointment } from '../../types';
import type { PaginationParams } from '../../services/api';
import {
  patientAPI,
  appointmentAPI,
  prescriptionAPI,
  labAPI,
  billingAPI,
} from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [
          patientResponse,
          appointmentsResponse,
          prescriptionsResponse,
          labOrdersResponse,
          invoicesResponse,
        ] = await Promise.all([
          patientAPI.getById(parseInt(id)),
          appointmentAPI.getAll({ patientId: parseInt(id) } as PaginationParams),
          prescriptionAPI.getAll({ patientId: parseInt(id) } as PaginationParams),
          labAPI.getAll({ patientId: parseInt(id) } as PaginationParams),
          billingAPI.getAll({ patientId: parseInt(id) } as PaginationParams),
        ]);

        setPatient(patientResponse.data);
        setAppointments(appointmentsResponse.data.data);
        setPrescriptions(prescriptionsResponse.data.data);
        setLabOrders(labOrdersResponse.data.data);
        setInvoices(invoicesResponse.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patient details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleNewAppointment = () => {
    navigate('/appointments/new', { state: { patientId: id } });
  };

  const handleNewPrescription = () => {
    navigate('/clinical/prescriptions/new', { state: { patientId: id } });
  };

  const handleNewLabOrder = () => {
    navigate('/clinical/lab/new', { state: { patientId: id } });
  };

  const handleNewInvoice = () => {
    navigate('/billing/invoices/new', { state: { patientId: id } });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!patient) {
    return (
      <Box p={3}>
        <Alert severity="error">Patient not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Patient Details
          </Typography>
          <Button startIcon={<EditIcon />} variant="contained" onClick={handleEdit}>
            Edit
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Name" secondary={patient.name} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Date of Birth"
                  secondary={new Date(patient.dateOfBirth).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Gender" secondary={patient.gender} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Contact" secondary={patient.phone} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={patient.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Address" secondary={patient.address} />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Blood Group" secondary={patient.bloodGroup || 'Not specified'} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Allergies"
                  secondary={
                    patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.join(', ')
                      : 'None'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Medical History"
                  secondary={patient.medicalHistory || 'No medical history recorded'}
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Emergency Contact
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Name" secondary={patient.emergencyContact?.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Relationship" secondary={patient.emergencyContact?.relationship} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Phone" secondary={patient.emergencyContact?.phone} />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient details tabs">
            <Tab label="Appointments" icon={<CalendarIcon />} iconPosition="start" />
            <Tab label="Prescriptions" icon={<PrescriptionIcon />} iconPosition="start" />
            <Tab label="Lab Orders" icon={<LabIcon />} iconPosition="start" />
            <Tab label="Billing" icon={<BillingIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Appointments</Typography>
            <Button variant="contained" onClick={handleNewAppointment}>
              New Appointment
            </Button>
          </Box>
          <List>
            {appointments.map((appointment) => (
              <ListItem
                key={appointment.id}
                secondaryAction={
                  <Chip
                    label={appointment.status}
                    color={
                      appointment.status === 'completed'
                        ? 'success'
                        : appointment.status === 'cancelled'
                        ? 'error'
                        : 'primary'
                    }
                  />
                }
              >
                <ListItemText
                  primary={`${new Date(appointment.dateTime).toLocaleDateString()}`}
                  secondary={`Type: ${appointment.type} | Room: ${appointment.roomNumber || 'TBD'}`}
                />
              </ListItem>
            ))}
            {appointments.length === 0 && (
              <ListItem>
                <ListItemText secondary="No appointments found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Prescriptions</Typography>
            <Button variant="contained" onClick={handleNewPrescription}>
              New Prescription
            </Button>
          </Box>
          <List>
            {prescriptions.map((prescription) => (
              <ListItem key={prescription.id}>
                <ListItemText
                  primary={new Date(prescription.date).toLocaleDateString()}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Diagnosis: {prescription.diagnosis}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Medications:{' '}
                        {prescription.medications
                          .map((med: { name: string; dosage: string }) => `${med.name} - ${med.dosage}`)
                          .join(', ')}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {prescriptions.length === 0 && (
              <ListItem>
                <ListItemText secondary="No prescriptions found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Lab Orders</Typography>
            <Button variant="contained" onClick={handleNewLabOrder}>
              New Lab Order
            </Button>
          </Box>
          <List>
            {labOrders.map((order) => (
              <ListItem key={order.id}>
                <ListItemText
                  primary={new Date(order.date).toLocaleDateString()}
                  secondary={
                    <>
                      {order.tests.map((test: { name: string; status: string; results?: string }, index: number) => (
                        <Typography key={index} component="span" variant="body2">
                          {test.name}: {test.status}
                          {test.results && ` - Results: ${test.results}`}
                          <br />
                        </Typography>
                      ))}
                    </>
                  }
                />
              </ListItem>
            ))}
            {labOrders.length === 0 && (
              <ListItem>
                <ListItemText secondary="No lab orders found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Billing</Typography>
            <Button variant="contained" onClick={handleNewInvoice}>
              New Invoice
            </Button>
          </Box>
          <List>
            {invoices.map((invoice) => (
              <ListItem
                key={invoice.id}
                secondaryAction={
                  <Chip
                    label={invoice.status}
                    color={
                      invoice.status === 'paid'
                        ? 'success'
                        : invoice.status === 'overdue'
                        ? 'error'
                        : 'primary'
                    }
                  />
                }
              >
                <ListItemText
                  primary={`Invoice #${invoice.id} - ${new Date(invoice.date).toLocaleDateString()}`}
                  secondary={`Total: $${invoice.total} | Payment Method: ${
                    invoice.payment_method || 'Not paid'
                  }`}
                />
              </ListItem>
            ))}
            {invoices.length === 0 && (
              <ListItem>
                <ListItemText secondary="No invoices found" />
              </ListItem>
            )}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientDetails;
