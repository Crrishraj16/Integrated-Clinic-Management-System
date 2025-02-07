import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { format, isValid, parseISO } from 'date-fns';
import * as yup from 'yup';
import { Appointment, Patient, User, AppointmentStatus, AppointmentType } from '../../types';
import { apiClient } from '../../services/api/client';
import { useFormValidation, validationSchemas } from '../../hooks/useFormValidation';
import { useNotifications } from '../../context/AppContext';
import { useAsync } from '../../hooks/useAsync';
import { ErrorAlert } from '../../components/ErrorAlert';
import { config } from '../../config';

interface AppointmentFormData {
  patientId: number;
  doctorId: number;
  dateTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  roomNumber: string;
  notes: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const appointmentSchema = yup.object().shape({
  patientId: yup.number().min(1, 'Please select a patient').required('Patient is required'),
  doctorId: yup.number().min(1, 'Please select a doctor').required('Doctor is required'),
  dateTime: validationSchemas.date.transform((value) => {
    return isValid(value) ? format(value, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") : value;
  }),
  type: yup.string().oneOf(['regular', 'emergency', 'followup'], 'Invalid appointment type').required('Type is required'),
  status: yup.string().oneOf(['scheduled', 'completed', 'cancelled'], 'Invalid status').required('Status is required'),
  roomNumber: yup.string().required('Room number is required'),
  notes: yup.string().optional(),
  notificationPreferences: yup.object().shape({
    email: yup.boolean(),
    sms: yup.boolean(),
    push: yup.boolean()
  }).required('Notification preferences are required'),
});

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useNotifications();

  const {
    data: patients = [],
    loading: loadingPatients,
    error: patientsError,
  } = useAsync<Patient[]>(() => apiClient.get('/patients'));

  const {
    data: doctors = [],
    loading: loadingDoctors,
    error: doctorsError,
  } = useAsync<User[]>(() => apiClient.get('/users?role=doctor'));

  const {
    data: appointment,
    loading: loadingAppointment,
    error: appointmentError,
  } = useAsync<Appointment>(
    () => (id ? apiClient.get(`/appointments/${id}`) : Promise.resolve(null))
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: 0,
    doctorId: 0,
    dateTime: new Date().toISOString(),
    type: 'regular',
    status: 'scheduled',
    roomNumber: '',
    notes: '',
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    }
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          apiClient.get('/patients'),
          apiClient.get('/users?role=doctor'),
          apiClient.get('/appointments'),
        ]);
        if (patientsRes.data && Array.isArray(patientsRes.data)) {
          setPatients(patientsRes.data);
        }
        if (doctorsRes.data && Array.isArray(doctorsRes.data)) {
          setDoctors(doctorsRes.data);
        }
        if (appointmentsRes.data && Array.isArray(appointmentsRes.data.data)) {
          setAppointments(appointmentsRes.data.data);
        }

        if (id) {
          const appointmentRes = await apiClient.get(`/appointments/${id}`);
          if (appointmentRes.data) {
            const appointment = appointmentRes.data;
            setFormData({
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              dateTime: appointment.dateTime,
              type: appointment.type || 'regular',
              status: appointment.status || 'scheduled',
              roomNumber: appointment.roomNumber || '',
              notes: appointment.notes || '',
            });
            setSelectedDate(new Date(appointment.dateTime));
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId) {
      setError('Please select both patient and doctor');
      return;
    }

    if (!formData.dateTime) {
      setError('Please select appointment date and time');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
        type: formData.type || 'regular',
        status: formData.status || 'scheduled',
      };

      if (id) {
        await apiClient.put(`/appointments/${id}`, payload);
      } else {
        await apiClient.post('/appointments', payload);
      }
      navigate('/appointments');
    } catch (err: unknown) {
      console.error('Error saving appointment:', err);
      setError('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (event: SelectChangeEvent<number>) => {
    const selectedPatient = patients?.find(p => p.id === event.target.value);
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id
      }));
    }
  };

  const handleDoctorChange = (event: SelectChangeEvent<number>) => {
    const selectedDoctor = doctors?.find(d => d.id === event.target.value);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: selectedDoctor.id
      }));
    }
  };

  const handleDateTimeChange = (newValue: Date | null) => {
    if (!newValue) return;

    const now = new Date();
    if (newValue < now) {
      setError('Please select a future date and time');
      return;
    }

    const hours = newValue.getHours();
    const startHour = parseInt(config.workingHours?.start?.split(':')[0] || '9');
    const endHour = parseInt(config.workingHours?.end?.split(':')[0] || '17');

    if (hours < startHour || hours >= endHour) {
      setError(`Please select a time between ${config.workingHours?.start || '09:00'} and ${config.workingHours?.end || '17:00'}`);
      return;
    }

    try {
      const validDate = new Date(newValue);
      if (isNaN(validDate.getTime())) {
        throw new Error('Invalid date');
      }

      // Check for existing appointments in the same time slot
      const existingAppointment = appointments.find(apt => {
        const aptDate = new Date(apt.dateTime);
        const diffInMinutes = Math.abs(aptDate.getTime() - validDate.getTime()) / (1000 * 60);
        return diffInMinutes < 30; // 30-minute slots
      });

      if (existingAppointment) {
        setError('This time slot is already booked. Please select another time.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        dateTime: validDate.toISOString(),
      }));
      setSelectedDate(validDate);
      setError(null);
    } catch (err) {
      setError('Invalid date selected. Please try again.');
    }
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value as AppointmentType;
    setFormData((prev) => ({
      ...prev,
      type,
      status: type === 'emergency' ? 'scheduled' : prev.status,
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value as AppointmentStatus;
    if (status === 'cancelled' && formData.type === 'emergency') {
      setError('Emergency appointments cannot be cancelled');
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      status,
    }));
    setError(null);
  };

  if (loading && !patients.length && !doctors.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      {error && <ErrorAlert message={error} />}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {id ? 'Edit Appointment' : 'New Appointment'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                value={formData.patientId.toString()}
                onChange={handlePatientChange}
                label="Patient"
                required
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.fullName || patient.name || 'Unknown'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={formData.doctorId.toString()}
                onChange={handleDoctorChange}
                label="Doctor"
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Date & Time"
              value={selectedDate}
              onChange={handleDateTimeChange}
              minTime={parse(config.workingHours?.start || '09:00', 'HH:mm', new Date())}
              maxTime={parse(config.workingHours?.end || '17:00', 'HH:mm', new Date())}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleTypeChange}
                label="Type"
                required
              >
                {(config.appointmentTypes || []).map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleStatusChange}
                label="Status"
                required
              >
                {(config.appointmentStatus || []).map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, roomNumber: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/appointments')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : id ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AppointmentForm;
