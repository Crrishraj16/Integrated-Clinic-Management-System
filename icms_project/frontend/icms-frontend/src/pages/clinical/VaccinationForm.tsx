import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Container, 
  Autocomplete 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { patientAPI, vaccinationAPI } from '../../services/api';
import { Patient, Vaccination } from '../../types';
import { useNavigate, useParams } from 'react-router-dom';

interface VaccinationFormData {
  patientId: number;
  vaccineType: string;
  doseNumber: number;
  administeredDate: string;
  batchNumber?: string;
  administeredBy?: string;
  administrationSite?: string;
  adverseReactions?: string;
}

const validationSchema = yup.object().shape({
  patientId: yup.number().required('Patient is required'),
  vaccineType: yup.string().required('Vaccine type is required'),
  doseNumber: yup.number().positive().required('Dose number is required'),
  administeredDate: yup.string().required('Administered date is required'),
});

const VaccinationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vaccinationData, setVaccinationData] = useState<VaccinationFormData>({
    patientId: 0,
    vaccineType: '',
    doseNumber: 1,
    administeredDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    administeredBy: '',
    administrationSite: '',
    adverseReactions: ''
  });

  const { 
    control, 
    handleSubmit, 
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm<VaccinationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: vaccinationData
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientAPI.getAll();
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients', error);
      }
    };

    fetchPatients();

    if (id) {
      const fetchVaccinationDetails = async () => {
        try {
          const response = await vaccinationAPI.getById(parseInt(id));
          const vaccination = response.data;
          setVaccinationData({
            patientId: vaccination.patientId,
            vaccineType: vaccination.vaccineType,
            doseNumber: vaccination.doseNumber,
            administeredDate: vaccination.administeredDate,
            batchNumber: vaccination.batchNumber || '',
            administeredBy: vaccination.administeredBy || '',
            administrationSite: vaccination.administrationSite || '',
            adverseReactions: vaccination.adverseReactions || ''
          });
        } catch (error) {
          console.error('Failed to fetch vaccination details', error);
        }
      };

      fetchVaccinationDetails();
    }
  }, [id]);

  const onSubmit = async (data: VaccinationFormData) => {
    try {
      if (id) {
        await vaccinationAPI.update(parseInt(id), data);
      } else {
        await vaccinationAPI.create(data);
      }
      navigate('/clinical/vaccinations');
    } catch (error) {
      console.error('Failed to save vaccination', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Vaccination' : 'Add Vaccination'}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={patients}
                  getOptionLabel={(option) => 
                    typeof option === 'number' 
                      ? patients.find(p => p.id === option)?.fullName || '' 
                      : option.fullName
                  }
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Patient" 
                      error={!!errors.patientId}
                      helperText={errors.patientId?.message}
                    />
                  )}
                  onChange={(_, newValue) => {
                    setValue('patientId', newValue ? (typeof newValue === 'number' ? newValue : newValue.id) : 0);
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="vaccineType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Vaccine Type"
                  error={!!errors.vaccineType}
                  helperText={errors.vaccineType?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="doseNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Dose Number"
                  error={!!errors.doseNumber}
                  helperText={errors.doseNumber?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="administeredDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Administered Date"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toISOString().split('T')[0] : '');
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.administeredDate}
                      helperText={errors.administeredDate?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="batchNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Batch Number"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="administeredBy"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Administered By"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="administrationSite"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Administration Site"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="adverseReactions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Adverse Reactions"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting}
            >
              {id ? 'Update' : 'Create'} Vaccination
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default VaccinationForm;
