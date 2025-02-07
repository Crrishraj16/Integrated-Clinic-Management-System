import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Divider,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { SelectChangeEvent } from '@mui/material';
import type { InsuranceClaim, Patient, Invoice } from '../../types';
import { claimsAPI, patientAPI, billingAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface InsuranceProvider {
  id: number;
  name: string;
  address: string;
  contact: string;
  email: string;
}

const ClaimsForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);

  const [claimData, setClaimData] = useState<Partial<InsuranceClaim & { diagnosis_codes?: string[]; procedure_codes?: string[] }>>({
    date: new Date().toISOString(),
    status: 'draft',
    amount: 0,
    diagnosis_codes: [],
    procedure_codes: [],
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patients
        const patientsResponse = await patientAPI.getAll();
        setPatients(patientsResponse.data.data);

        // Fetch insurance providers
        const providersResponse = await claimsAPI.getAll();
        setInsuranceProviders(providersResponse.data.data.map(claim => ({
          id: claim.insuranceProvider,
          name: claim.insuranceProvider,
          address: '',
          contact: '',
          email: ''
        })));

        // If editing, fetch claim details
        if (isEdit && id) {
          const claimResponse = await claimsAPI.getById(parseInt(id));
          setClaimData(claimResponse.data);

          // Set selected patient
          const patient = patientsResponse.data.data.find(
            (p) => p.id === claimResponse.data.patientId
          );
          setSelectedPatient(patient || null);

          // Fetch and set selected invoice
          if (claimResponse.data.invoiceId) {
            const invoiceResponse = await billingAPI.getById(
              claimResponse.data.invoiceId
            );
            setSelectedInvoice(invoiceResponse.data);
          }
        }

        setError(null);
      } catch (err) {
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedPatient?.id) {
        setInvoices([]);
        return;
      }

      try {
        const response = await billingAPI.getAll({ patientId: selectedPatient.id });
        setInvoices(response.data.data.filter((inv: Invoice) => inv.status === 'pending'));
      } catch (err) {
        setError('Failed to fetch patient invoices');
      }
    };

    fetchInvoices();
  }, [selectedPatient]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (!selectedInvoice) {
      setError('Please select an invoice');
      return;
    }

    if (!claimData.insuranceProvider) {
      setError('Please select an insurance provider');
      return;
    }

    const claimPayload = {
      ...claimData,
      patientId: selectedPatient.id,
      invoiceId: selectedInvoice.id,
      status: claimData.status || 'pending',
      submissionDate: new Date().toISOString(),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await claimsAPI.update(parseInt(id), claimPayload);
      } else {
        await claimsAPI.create(claimPayload);
      }
      navigate('/billing/claims');
    } catch (err) {
      setError('Failed to save claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !claimData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Insurance Claim' : 'New Insurance Claim'}
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
                  setSelectedInvoice(null);
                }}
                options={patients}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField {...params} label="Patient" required />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Claim Number"
                value={claimData.claimNumber || ''}
                disabled
                helperText="Auto-generated on save"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Claim Date"
                value={claimData.date ? new Date(claimData.date) : null}
                onChange={(date) =>
                  setClaimData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Insurance Provider</InputLabel>
                <Select
                  value={claimData.insuranceProvider || ''}
                  onChange={(e: SelectChangeEvent<string>) =>
                    setClaimData((prev: any) => ({
                      ...prev,
                      insuranceProvider: e.target.value,
                    }))
                  }
                  label="Insurance Provider"
                >
                  {insuranceProviders.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Invoice Details" />
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Invoice</InputLabel>
                <Select
                  value={selectedInvoice?.id || ''}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    const invoice = invoices.find((inv) => inv.id === e.target.value);
                    setSelectedInvoice(invoice || null);
                    if (invoice) {
                      setClaimData((prev: any) => ({
                        ...prev,
                        amount: invoice.total,
                      }));
                    }
                  }}
                  label="Select Invoice"
                  disabled={!selectedPatient}
                >
                  {invoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      Invoice #{invoice.id} - ${invoice.total.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Claim Amount"
                type="number"
                value={claimData.amount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClaimData((prev: any) => ({
                    ...prev,
                    amount: parseFloat(e.target.value),
                  }))
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={claimData.status || 'draft'}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                    setClaimData((prev: any) => ({
                      ...prev,
                      status: e.target.value as InsuranceClaim['status'],
                    }))
                  }
                  label="Status"
                  disabled={!isEdit}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis Codes (ICD-10)"
                value={claimData.diagnosis_codes?.join(', ') || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClaimData((prev: any) => ({
                    ...prev,
                    diagnosis_codes: e.target.value.split(',').map((code) => code.trim()),
                  }))
                }
                helperText="Enter comma-separated ICD-10 codes"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Procedure Codes (CPT/HCPCS)"
                value={claimData.procedure_codes?.join(', ') || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClaimData((prev: any) => ({
                    ...prev,
                    procedure_codes: e.target.value.split(',').map((code) => code.trim()),
                  }))
                }
                helperText="Enter comma-separated CPT/HCPCS codes"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={claimData.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClaimData((prev: any) => ({
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
                <Button variant="outlined" onClick={() => navigate('/billing/claims')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Claim
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClaimsForm;
