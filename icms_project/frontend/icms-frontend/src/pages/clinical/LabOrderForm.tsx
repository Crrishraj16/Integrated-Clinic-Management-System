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
import { Patient, User } from '../../types';

export enum LabTestStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat'
}

interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive' | 'deleted';
}

interface LabTest {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  requiredFasting: boolean;
  instructions?: string;
  category?: string;
  normalRange?: string;
  unit?: string;
}

interface LabTestOrder {
  testId: number;
  test?: LabTest;
  instructions?: string;
  status: LabTestStatus;
  priority: Priority;
  name: string;
  description: string;
}

interface LabOrder extends BaseEntity {
  patientId: number;
  doctorId: number;
  date: string;
  tests: LabTestOrder[];
  notes?: string;
  patient?: Patient;
  doctor?: User;
  status: LabTestStatus;
  priority: Priority;
}

import { labAPI, patientAPI, userAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const initialLabOrderState: LabOrder = {
  id: 0,
  patientId: 0,
  doctorId: 0,
  date: new Date().toISOString(),
  tests: [],
  notes: '',
  status: LabTestStatus.PENDING,
  priority: Priority.ROUTINE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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

  const [labOrder, setLabOrder] = useState<LabOrder>(initialLabOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [newTest, setNewTest] = useState<LabTestOrder>({
    testId: 0,
    name: '',
    description: '',
    price: 0,
    requiredFasting: false,
    instructions: '',
    status: LabTestStatus.PENDING,
    priority: Priority.ROUTINE,
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
          const labOrder = labOrderResponse.data;
          setLabOrder({
            ...labOrder,
            tests: labOrder.tests.map((test: LabTestOrder) => ({
              ...test,
              status: test.status || LabTestStatus.PENDING,
              priority: test.priority || Priority.ROUTINE,
            })),
          });

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
    if (!newTest.name) {
      setError('Please select a test');
      return;
    }

    const test: LabTestOrder = {
      ...newTest,
      testId: Date.now(),
    };

    setLabOrder((prev) => {
      const tests = [...(prev.tests || []), test];
      const priority = tests.some(t => t.priority === Priority.STAT) ? Priority.STAT :
                      tests.some(t => t.priority === Priority.URGENT) ? Priority.URGENT :
                      Priority.ROUTINE;

      return {
        ...prev,
        tests,
        priority,
      };
    });

    setNewTest({
      testId: 0,
      name: '',
      description: '',
      price: 0,
      requiredFasting: false,
      instructions: '',
      status: LabTestStatus.PENDING,
      priority: Priority.ROUTINE,
    });
  };

  const handleRemoveTest = (index: number): void => {
    setLabOrder((prev) => ({
      ...prev,
      tests: prev.tests.filter((_: LabTestOrder, i: number) => i !== index),
    }));
  };

  const handleTestChange = (index: number, field: keyof LabTestOrder, value: any) => {
    setLabOrder((prev) => {
      const newTests = [...prev.tests];
      newTests[index] = {
        ...newTests[index],
        [field]: value,
      };
      return {
        ...prev,
        tests: newTests,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }

    if (!labOrder.tests.length) {
      setError('Please add at least one test');
      return;
    }

    try {
      setLoading(true);

      // Validate test priorities
      const hasStatTest = labOrder.tests.some(test => test.priority === Priority.STAT);
      const hasUrgentTest = labOrder.tests.some(test => test.priority === Priority.URGENT);

      const labOrderPayload: Omit<LabOrder, keyof BaseEntity> = {
        ...labOrder,
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        status: LabTestStatus.PENDING,
        priority: hasStatTest ? Priority.STAT :
                 hasUrgentTest ? Priority.URGENT :
                 Priority.ROUTINE,
        date: new Date().toISOString(),
        tests: labOrder.tests.map(test => ({
          testId: test.testId,
          test: test.test,
          instructions: test.instructions,
          status: test.status,
          priority: test.priority,
          name: test.name,
          description: test.description,
        })),
      };

      if (isEdit && id) {
        await labAPI.update(parseInt(id), labOrderPayload);
      } else {
        await labAPI.create(labOrderPayload);
      }
      navigate('/clinical/lab');
    } catch (err) {
      console.error('Error saving lab order:', err);
      setError('Failed to save lab order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !labOrder) {
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
                onChange={(_: any, newValue: Patient | null) => {
                  setSelectedPatient(newValue);
                }}
                options={patients}
                getOptionLabel={(option: Patient) => `${option.firstName} ${option.lastName}`}
                renderInput={(params) => <TextField {...params} label="Patient" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedDoctor}
                onChange={(_: any, newValue: User | null) => {
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
                value={labOrder.date ? new Date(labOrder.date) : null}
                onChange={(date) =>
                  setLabOrder((prev) => ({
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
                    value={commonTests.find(t => t.name === newTest.name) || null}
                    onChange={(_: any, value: { name: string; description?: string } | null) => {
                      if (value) {
                        setNewTest(prev => ({
                          ...prev,
                          testId: Date.now(),
                          name: value.name,
                          description: value.description || '',
                          price: 0,
                          requiredFasting: false,
                        }));
                      }
                    }}
                    options={commonTests}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <Typography variant="subtitle1">{option.name}</Typography>
                          {option.description && (
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                        </div>
                      </li>
                    )}
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
                {labOrder.tests.map((test: LabTestOrder, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={test.name}
                      secondary={
                        <>
                          {test.description && <div>{test.description}</div>}
                          <div>{test.instructions || 'No special instructions'}</div>
                          <div>Status: {test.status}</div>
                          <div>Priority: {test.priority}</div>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveTest(index as number)}
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
                value={labOrder.notes}
                onChange={(e) =>
                  setLabOrder((prev) => ({
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
