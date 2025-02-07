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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LabOrder, LabTest, Patient, User } from '../../types';
import { labAPI, patientAPI, userAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface OrderTest extends Omit<LabTest, keyof BaseEntity> {
  testId: number;
  test?: LabTest;
  instructions?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const initialLabOrderState: Partial<LabOrder> = {
  date: new Date().toISOString(),
  tests: [],
  notes: '',
};

const commonTests: Array<{ name: string; description?: string }> = [
  { name: 'Complete Blood Count (CBC)', description: 'Basic blood test that measures different components of blood' },
  { name: 'Basic Metabolic Panel (BMP)', description: 'Tests kidney function, blood sugar, and electrolyte levels' },
  { name: 'Comprehensive Metabolic Panel (CMP)', description: 'Tests liver and kidney function, blood sugar, and electrolyte levels' },
  { name: 'Lipid Panel', description: 'Measures cholesterol and triglycerides' },
  { name: 'Thyroid Function Tests', description: 'Measures thyroid hormone levels' },
  { name: 'Hemoglobin A1C', description: 'Measures average blood sugar over past 3 months' },
  { name: 'Urinalysis', description: 'Tests urine for various conditions' },
  { name: 'Liver Function Tests', description: 'Measures liver enzyme levels' },
  { name: 'Prostate-Specific Antigen (PSA)', description: 'Screens for prostate cancer' },
  { name: 'Vitamin D', description: 'Measures vitamin D levels in blood' },
];

const LabOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = !!id;

  const [labOrderData, setLabOrderData] = useState<Omit<LabOrder, keyof BaseEntity>>(initialLabOrderState as Omit<LabOrder, keyof BaseEntity>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [newTest, setNewTest] = useState<OrderTest & { testId: number }>({
    testId: 0,
    instructions: '',
    status: 'pending',
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

        // If editing, fetch lab order details
        if (isEdit && id) {
          const labOrderResponse = await labAPI.getById(parseInt(id));
          setLabOrderData(labOrderResponse.data);

          // Set selected patient and doctor
          const patient = patientsResponse.data.data.find(
            (p) => p.id === labOrderResponse.data.patient_id
          );
          const doctor = doctorsResponse.data.data.find(
            (d) => d.id === labOrderResponse.data.doctor_id
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

  const handleAddTest = (): void => {
    if (!newTest.testId) {
      return;
    }

    setLabOrderData((prev) => ({
      ...prev,
      tests: [...(prev.tests || []), newTest],
    }));

    setNewTest({
      name: '',
    price: 0,
    requiredFasting: false,
      instructions: '',
      status: 'pending',
    });
  };

  const handleRemoveTest = (index: number): void => {
    setLabOrderData((prev) => ({
      ...prev,
      tests: prev.tests?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }

    if (!labOrderData.tests?.length) {
      setError('Please add at least one test');
      return;
    }

    const labOrderPayload = {
      ...labOrderData,
      patientId: selectedPatient.id,
      doctorId: selectedDoctor.id,
      status: 'pending' as LabTestStatus,
      date: new Date().toISOString(),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await labAPI.update(parseInt(id), labOrderPayload);
      } else {
        await labAPI.create(labOrderPayload);
      }
      navigate('/clinical/lab');
    } catch (err) {
      setError('Failed to save lab order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !labOrderData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Lab Order' : 'New Lab Order'}
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
                onChange={(_event: any, newValue: Patient | null) => {
                  setSelectedPatient(newValue);
                }}
                options={patients}
                getOptionLabel={(option: Patient) => option.fullName}
                renderInput={(params) => <TextField {...params} label="Patient" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedDoctor}
                onChange={(_event: any, newValue: User | null) => {
                  setSelectedDoctor(newValue);
                }}
                options={doctors}
                getOptionLabel={(option: User) => option.name}
                renderInput={(params) => <TextField {...params} label="Doctor" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={labOrderData.date ? new Date(labOrderData.date) : null}
                onChange={(date) =>
                  setLabOrderData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tests
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    freeSolo
                    value={newTest.test?.name || ''}
                    onChange={(event, newValue) =>
                      setNewTest((prev) => ({
                        ...prev,
                        testId: tests.find(t => t.name === newValue)?.id || 0,
                        test: tests.find(t => t.name === newValue),
                      }))
                    }
                    onInputChange={(event, newValue) =>
                      setNewTest((prev) => ({
                        ...prev,
                        testId: tests.find(t => t.name === newValue)?.id || 0,
                        test: tests.find(t => t.name === newValue),
                      }))
                    }
                    options={tests.map(t => t.name)}
                    renderInput={(params) => (
                      <TextField {...params} label="Test Name" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    value={newTest.instructions}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddTest}
                    sx={{ height: '100%' }}
                    fullWidth
                  >
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>

              <List sx={{ mt: 2 }}>
                {labOrderData.tests?.map((test, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={test.test?.name || ''}
                      secondary={test.instructions || 'No special instructions'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveTest(index)}
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
                value={labOrderData.notes || ''}
                onChange={(e) =>
                  setLabOrderData((prev) => ({
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
                <Button variant="outlined" onClick={() => navigate('/clinical/lab')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Lab Order
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LabOrderForm;
