import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Patient, InsuranceInfo } from '../../types';
import { patientAPI } from '../../services/api';

const steps = ['Personal Information', 'Medical Information', 'Insurance Information'];

const initialPatientState: Omit<Patient, 'id'> = {
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  allergies: [],
  medicalHistory: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  insurance: {
    provider: '',
    policyNumber: '',
    validFrom: '',
    validUntil: '',
    primaryHolder: '',
    relationship: '',
    groupNumber: '',
  },
};

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [patientData, setPatientData] = useState<Omit<Patient, 'id'>>(initialPatientState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: string, value: any) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const handleInsuranceChange = (field: keyof InsuranceInfo, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        [field]: value,
      },
    }));
  };

  const handleAllergiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allergies = event.target.value.split(',').map((allergy) => allergy.trim());
    setPatientData((prev) => ({
      ...prev,
      allergies,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await patientAPI.create(patientData);
      navigate('/patients');
    } catch (err) {
      setError('Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Full Name"
          value={patientData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Date of Birth"
          value={patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : null}
          onChange={(date) => handleInputChange('dateOfBirth', date?.toISOString())}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={patientData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            label="Gender"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Number"
          value={patientData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={patientData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={3}
          value={patientData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          required
        />
      </Grid>
    </Grid>
  );

  const renderMedicalInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Blood Group</InputLabel>
          <Select
            value={patientData.bloodGroup || ''}
            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
            label="Blood Group"
          >
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Allergies"
          helperText="Enter allergies separated by commas"
          value={patientData.allergies?.join(', ') || ''}
          onChange={handleAllergiesChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Medical History"
          multiline
          rows={4}
          value={patientData.medicalHistory || ''}
          onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Emergency Contact
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={patientData.emergencyContact.name}
          onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Relationship"
          value={patientData.emergencyContact.relationship}
          onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          value={patientData.emergencyContact.phone}
          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
          required
        />
      </Grid>
    </Grid>
  );

  const renderInsuranceInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Insurance Provider"
          value={patientData.insurance.provider}
          onChange={(e) => handleInsuranceChange('provider', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Policy Number"
          value={patientData.insurance.policyNumber}
          onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Expiry Date"
          value={patientData.insurance.validUntil ? new Date(patientData.insurance.validUntil) : null}
          onChange={(date) => handleInsuranceChange('validUntil', date?.toISOString() || '')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Valid From"
          value={patientData.insurance.validFrom ? new Date(patientData.insurance.validFrom) : null}
          onChange={(date) => handleInsuranceChange('validFrom', date?.toISOString() || '')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Primary Holder"
          value={patientData.insurance.primaryHolder}
          onChange={(e) => handleInsuranceChange('primaryHolder', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Group Number"
          value={patientData.insurance.groupNumber || ''}
          onChange={(e) => handleInsuranceChange('groupNumber', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Relationship to Primary Holder"
          value={patientData.insurance.relationship || ''}
          onChange={(e) => handleInsuranceChange('relationship', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderMedicalInfo();
      case 2:
        return renderInsuranceInfo();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Patient Registration
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form>
          {getStepContent(activeStep)}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientRegistration;
