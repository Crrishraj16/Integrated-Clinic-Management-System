import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Vaccination, Patient, VaccineType } from '../../types';
import { vaccinationAPI, patientAPI, vaccineAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const initialVaccinationState: Partial<Vaccination> = {
  date: new Date().toISOString(),
  status: 'scheduled',
  dose_number: 1,
  notes: '',
};

const VaccinationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = !!id;

  const [vaccinationData, setVaccinationData] = useState<Partial<Vaccination>>(
    initialVaccinationState
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vaccines, setVaccines] = useState<VaccineType[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineType | null>(null);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patients
        const patientsResponse = await patientAPI.getAll();
        setPatients(patientsResponse.data.data);

        // Fetch vaccine types
        const vaccinesResponse = await vaccineAPI.getTypes();
        setVaccines(vaccinesResponse.data);

        // If editing, fetch vaccination details
        if (isEdit && id) {
          const vaccinationResponse = await vaccinationAPI.getById(parseInt(id));
          setVaccinationData(vaccinationResponse.data);

          // Set selected patient and vaccine
          const patient = patientsResponse.data.data.find(
            (p) => p.id === vaccinationResponse.data.patient_id
          );
          const vaccine = vaccinesResponse.data.find(
            (v) => v.id === vaccinationResponse.data.vaccine_id
          );

          setSelectedPatient(patient || null);
          setSelectedVaccine(vaccine || null);
          setNextDueDate(
            vaccinationResponse.data.next_due_date
              ? new Date(vaccinationResponse.data.next_due_date)
              : null
          );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedVaccine) {
      setError('Please select both patient and vaccine');
      return;
    }

    const vaccinationPayload = {
      ...vaccinationData,
      patient_id: selectedPatient.id,
      vaccine_id: selectedVaccine.id,
      vaccine_name: selectedVaccine.name,
      next_due_date: nextDueDate?.toISOString(),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await vaccinationAPI.update(parseInt(id), vaccinationPayload);
      } else {
        await vaccinationAPI.create(vaccinationPayload);
      }
      navigate('/clinical/vaccinations');
    } catch (err) {
      setError('Failed to save vaccination record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDueDate = (vaccineId: number, doseNumber: number) => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    if (!vaccine || !vaccine.schedule || doseNumber >= vaccine.schedule.length) {
      setNextDueDate(null);
      return;
    }

    const interval = vaccine.schedule[doseNumber];
    const nextDate = new Date(vaccinationData.date || new Date());
    nextDate.setDate(nextDate.getDate() + interval);
    setNextDueDate(nextDate);
  };

  if (loading && !vaccinationData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Vaccination Record' : 'New Vaccination Record'}
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
                value={selectedVaccine}
                onChange={(event, newValue) => {
                  setSelectedVaccine(newValue);
                  if (newValue) {
                    calculateNextDueDate(newValue.id, vaccinationData.dose_number || 1);
                  }
                }}
                options={vaccines}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Vaccine" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Vaccination Date"
                value={vaccinationData.date ? new Date(vaccinationData.date) : null}
                onChange={(date) =>
                  setVaccinationData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dose Number"
                type="number"
                value={vaccinationData.dose_number || ''}
                onChange={(e) => {
                  const doseNumber = parseInt(e.target.value);
                  setVaccinationData((prev) => ({
                    ...prev,
                    dose_number: doseNumber,
                  }));
                  if (selectedVaccine) {
                    calculateNextDueDate(selectedVaccine.id, doseNumber);
                  }
                }}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={vaccinationData.status || 'scheduled'}
                  onChange={(e) =>
                    setVaccinationData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Next Due Date"
                value={nextDueDate}
                onChange={(date) => setNextDueDate(date)}
                disabled={!selectedVaccine?.schedule}
              />
              {selectedVaccine?.schedule && (
                <FormHelperText>
                  Automatically calculated based on vaccine schedule
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch Number"
                value={vaccinationData.batch_number || ''}
                onChange={(e) =>
                  setVaccinationData((prev) => ({
                    ...prev,
                    batch_number: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Administered By"
                value={vaccinationData.administered_by || ''}
                onChange={(e) =>
                  setVaccinationData((prev) => ({
                    ...prev,
                    administered_by: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site of Administration"
                value={vaccinationData.administration_site || ''}
                onChange={(e) =>
                  setVaccinationData((prev) => ({
                    ...prev,
                    administration_site: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adverse Reactions"
                value={vaccinationData.adverse_reactions || ''}
                onChange={(e) =>
                  setVaccinationData((prev) => ({
                    ...prev,
                    adverse_reactions: e.target.value,
                  }))
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={vaccinationData.notes || ''}
                onChange={(e) =>
                  setVaccinationData((prev) => ({
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
                  onClick={() => navigate('/clinical/vaccinations')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Vaccination Record
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default VaccinationForm;
