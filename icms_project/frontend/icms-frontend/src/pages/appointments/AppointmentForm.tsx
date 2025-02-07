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
import { parse, format } from 'date-fns';
import { Appointment, Patient, User, AppointmentType, AppointmentStatus } from '../../types';
import { appointmentAPI, patientAPI, userAPI } from '../../services/api';
import config from '../../config';
import ErrorAlert from '../../components/ErrorAlert';

type AppointmentFormData = Omit<Appointment, 'id' | 'patient' | 'doctor' | 'createdAt' | 'updatedAt'>;

const initialFormState: AppointmentFormData = {
  patientId: 0,
  doctorId: 0,
  dateTime: new Date().toISOString(),
  type: 'regular' as AppointmentType,
  status: 'scheduled' as AppointmentStatus,
  roomNumber: '',
  notes: '',
};

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormState);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, doctorsRes] = await Promise.all([
          patientAPI.getAll(),
          userAPI.getAll({ role: 'doctor' }),
        ]);
        if (patientsRes.data && Array.isArray(patientsRes.data)) {
          setPatients(patientsRes.data);
        }
        if (doctorsRes.data && Array.isArray(doctorsRes.data)) {
          setDoctors(doctorsRes.data);
        }

        if (id) {
          const appointmentRes = await appointmentAPI.getById(parseInt(id));
          if (appointmentRes.data) {
            const appointment = appointmentRes.data;
            setFormData({
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            dateTime: appointment.dateTime,
            type: appointment.type,
            status: appointment.status,
            roomNumber: appointment.roomNumber,
            notes: appointment.notes,
          });
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
    try {
      setLoading(true);
      if (id) {
        await appointmentAPI.update(parseInt(id), formData);
      } else {
        await appointmentAPI.create(formData);
      }
      navigate('/appointments');
    } catch (err: unknown) {
      console.error('Error saving appointment:', err);
      setError('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      patientId: Number(event.target.value),
    }));
  };

  const handleDoctorChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: Number(event.target.value),
    }));
  };

  const handleDateTimeChange = (newValue: Date | null) => {
    if (!newValue) return;

    const hours = newValue.getHours();
    const startHour = parseInt(config.workingHours.start.split(':')[0]);
    const endHour = parseInt(config.workingHours.end.split(':')[0]);

    if (hours < startHour || hours >= endHour) {
      setError(`Please select a time between ${config.workingHours.start} and ${config.workingHours.end}`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      dateTime: newValue.toISOString(),
    }));
    setSelectedDate(newValue);
    setError(null);
  };

  const handleTypeChange = (event: SelectChangeEvent<AppointmentType>) => {
    setFormData((prev) => ({
      ...prev,
      type: event.target.value as AppointmentType,
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent<AppointmentStatus>) => {
    setFormData((prev) => ({
      ...prev,
      status: event.target.value as AppointmentStatus,
    }));
  };

  if (loading && !patients.length && !doctors.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            {id ? 'Edit Appointment' : 'New Appointment'}
          </Typography>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={formData.patientId}
                    onChange={handlePatientChange}
                    label="Patient"
                    required
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={formData.doctorId}
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
                  minTime={parse(config.workingHours.start, 'HH:mm', new Date())}
                  maxTime={parse(config.workingHours.end, 'HH:mm', new Date())}
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
                    {config.appointmentTypes.map((type) => (
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
                    {config.appointmentStatus.map((status) => (
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
        </Box>
      </Paper>
    </Box>
  );
};

export default AppointmentForm;
