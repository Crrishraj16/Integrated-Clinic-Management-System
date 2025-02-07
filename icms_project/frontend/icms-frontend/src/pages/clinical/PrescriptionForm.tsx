import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Alert,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Prescription, Patient, User } from '../../types';
import { prescriptionAPI, patientAPI, userAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

const initialPrescriptionState: Partial<Prescription> = {
  date: new Date().toISOString(),
  medications: [],
  diagnosis: '',
  notes: '',
};

const PrescriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = !!id;

  const [prescriptionData, setPrescriptionData] = useState<Partial<Prescription>>(
    initialPrescriptionState
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch doctors (users with role 'doctor')
        const doctorsResponse = await userAPI.getAll({ role: 'doctor' });
        setDoctors(doctorsResponse.data.data);

        // Fetch patients
        const patientsResponse = await patientAPI.getAll();
        setPatients(patientsResponse.data.data);

        // If editing, fetch prescription details
        if (isEdit && id) {
          const prescriptionResponse = await prescriptionAPI.getById(parseInt(id));
          setPrescriptionData(prescriptionResponse.data);

          // Set selected patient and doctor
          const patient = patientsResponse.data.data.find(
            (p) => p.id === prescriptionResponse.data.patient_id
          );
          const doctor = doctorsResponse.data.data.find(
            (d) => d.id === prescriptionResponse.data.doctor_id
          );

          setSelectedPatient(patient || null);
          setSelectedDoctor(doctor || null);
        }
        // If creating with pre-selected patient
        else if (location.state?.patientId) {
          const patient = patientsResponse.data.data.find(
            (p) => p.id === parseInt(location.state.patientId)
          );
          setSelectedPatient(patient || null);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, location.state]);

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.duration) {
      return;
    }

    setPrescriptionData((prev) => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication],
    }));

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    });
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }

    if (!prescriptionData.medications?.length) {
      setError('Please add at least one medication');
      return;
    }

    const prescriptionPayload = {
      ...prescriptionData,
      patient_id: selectedPatient.id,
      doctor_id: selectedDoctor.id,
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await prescriptionAPI.update(parseInt(id), prescriptionPayload);
      } else {
        await prescriptionAPI.create(prescriptionPayload as Omit<Prescription, 'id'>);
      }
      navigate('/clinical/prescriptions');
    } catch (err) {
      setError('Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !prescriptionData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Prescription' : 'New Prescription'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                }}
                options={patients}
                getOptionLabel={(option) => option.full_name}
                renderInput={(params) => <TextField {...params} label="Patient" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedDoctor}
                onChange={(event, newValue) => {
                  setSelectedDoctor(newValue);
                }}
                options={doctors}
                getOptionLabel={(option) => option.full_name}
                renderInput={(params) => <TextField {...params} label="Doctor" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={prescriptionData.date ? new Date(prescriptionData.date) : null}
                onChange={(date) =>
                  setPrescriptionData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={prescriptionData.diagnosis || ''}
                onChange={(e) =>
                  setPrescriptionData((prev) => ({
                    ...prev,
                    diagnosis: e.target.value,
                  }))
                }
                required
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Medicine Name"
                    value={newMedication.name}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        dosage: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Frequency"
                    value={newMedication.frequency}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={newMedication.duration}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={newMedication.notes}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddMedication}
                    sx={{ height: '100%' }}
                  >
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>

              <List sx={{ mt: 2 }}>
                {prescriptionData.medications?.map((medication, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={medication.name}
                      secondary={`${medication.dosage} - ${medication.frequency} - ${medication.duration}${
                        medication.notes ? ` (${medication.notes})` : ''
                      }`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={prescriptionData.notes || ''}
                onChange={(e) =>
                  setPrescriptionData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/clinical/prescriptions')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Prescription
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PrescriptionForm;
