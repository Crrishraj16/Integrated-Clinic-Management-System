import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  LocalHospital as MedicationIcon,
  Science as LabIcon,
  Event as AppointmentIcon,
  Vaccines as VaccineIcon,
  Note as NoteIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  patientAPI,
  prescriptionAPI,
  labAPI,
  appointmentAPI,
  vaccinationAPI,
} from '../../services/api';
import { Patient, User } from '../../types';

interface Prescription {
  id: number;
  patientId: number;
  patient?: Patient;
  doctorId: number;
  doctor?: User;
  medications: Array<{
    medicationId: number;
    medication?: {
      id: number;
      name: string;
    };
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  diagnosis?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

interface LabOrder {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  tests: Array<{
    testId: number;
    test?: {
      id: number;
      name: string;
    };
    instructions?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }>;
  notes?: string;
  patient?: Patient;
  doctor?: User;
  status: 'pending' | 'completed' | 'cancelled';
}

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  type: 'regular' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  patient?: Patient;
  doctor?: User;
}

interface Vaccination {
  id: number;
  patientId: number;
  patient?: Patient;
  vaccineName: string;
  dose: string;
  date: string;
  nextDueDate?: string;
  administeredBy: number;
  administeredByUser?: User;
  batchNumber?: string;
  manufacturer?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
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
      id={`medical-history-tabpanel-${index}`}
      aria-labelledby={`medical-history-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientMedicalHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [
          patientResponse,
          prescriptionsResponse,
          labOrdersResponse,
          appointmentsResponse,
          vaccinationsResponse,
        ] = await Promise.all([
          patientAPI.getById(parseInt(id)),
          prescriptionAPI.getAll({ page: 1, limit: 100, filters: { patientId: parseInt(id) } }),
          labAPI.getAll({ page: 1, limit: 100, filters: { patientId: parseInt(id) } }),
          appointmentAPI.getAll({ page: 1, limit: 100, filters: { patientId: parseInt(id) } }),
          vaccinationAPI.getAll({ page: 1, limit: 100, filters: { patientId: parseInt(id) } }),
        ]);

        setPatient(patientResponse.data);
        setPrescriptions(prescriptionsResponse.data.data);
        setLabOrders(labOrdersResponse.data.data);
        setAppointments(appointmentsResponse.data.data);
        setVaccinations(vaccinationsResponse.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch medical history');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !patient) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Patient not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Medical History
            </Typography>
            <Typography variant="h6">{`${patient.firstName} ${patient.lastName}`}</Typography>
            <Typography color="text.secondary">
              ID: {patient.id} | DOB: {format(new Date(patient.dateOfBirth), 'PP')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
              {(patient.allergies || []).map((allergy: string, index: number) => (
                <Chip
                  key={index}
                  icon={<AlertIcon />}
                  label={allergy}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Prescriptions" icon={<MedicationIcon />} />
          <Tab label="Lab Orders" icon={<LabIcon />} />
          <Tab label="Appointments" icon={<AppointmentIcon />} />
          <Tab label="Vaccinations" icon={<VaccineIcon />} />
          <Tab label="Clinical Notes" icon={<NoteIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <List>
            {prescriptions.map((prescription) => (
              <React.Fragment key={prescription.id}>
                <ListItem>
                  <ListItemIcon>
                    <MedicationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={prescription.medications[0]?.medication?.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {prescription.medications[0]?.dosage} - {prescription.medications[0]?.frequency}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          Prescribed by Dr. {prescription.doctor?.name} on{' '}
                          {format(new Date(prescription.createdAt), 'PP')}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={prescription.status}
                    color={
                      prescription.status === 'active'
                        ? 'success'
                        : prescription.status === 'completed'
                        ? 'default'
                        : 'error'
                    }
                    size="small"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {labOrders.map((order) => (
              <React.Fragment key={order.id}>
                <ListItem>
                  <ListItemIcon>
                    <LabIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={order.tests[0]?.test?.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {order.notes}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          Ordered by Dr. {order.doctor?.name} on{' '}
                          {format(new Date(order.date), 'PP')}
                        </Typography>
                      </>
                    }
                  />
                  <Box>
                    <Chip
                      label={order.status}
                      color={
                        order.status === 'completed'
                          ? 'success'
                          : order.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {order.status === 'completed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={`/lab-orders/${order.id}/results`}
                        target="_blank"
                      >
                        View Results
                      </Button>
                    )}
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {appointments.map((appointment) => (
              <React.Fragment key={appointment.id}>
                <ListItem>
                  <ListItemIcon>
                    <AppointmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Dr. ${appointment.doctor?.name} - ${appointment.type}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {format(new Date(appointment.dateTime), 'PPp')}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          Type: {appointment.type}, {appointment.notes || 'No notes'}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={appointment.status}
                    color={
                      appointment.status === 'completed'
                        ? 'success'
                        : appointment.status === 'scheduled'
                        ? 'primary'
                        : appointment.status === 'cancelled'
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <List>
            {vaccinations.map((vaccination) => (
              <React.Fragment key={vaccination.id}>
                <ListItem>
                  <ListItemIcon>
                    <VaccineIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={vaccination.vaccineName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Dose {vaccination.dose}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          Administered on{' '}
                          {format(new Date(vaccination.date), 'PP')}
                          {vaccination.nextDueDate && (
                            <>
                              {' '}
                              | Next dose due:{' '}
                              {format(new Date(vaccination.nextDueDate), 'PP')}
                            </>
                          )}
                        </Typography>
                      </>
                    }
                  />
                  <Box>
                    {vaccination.nextDueDate && (
                      <Chip
                        label="Due Soon"
                        color="warning"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      href={`/vaccinations/${vaccination.id}/certificate`}
                      target="_blank"
                    >
                      Certificate
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <List>
            {(patient.clinicalNotes || []).map((note: { date: string; note: string; doctorId: number; doctor?: { name: string } }, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <NoteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={format(new Date(note.date), 'PPp')}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {note.note}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          By Dr. {note.doctor?.name} on{' '}
                          {format(new Date(note.date), 'PPp')}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientMedicalHistory;
