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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Payment, Invoice } from '../../types';
import { billingAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    date: new Date().toISOString(),
    amount: 0,
    payment_method: 'cash',
    status: 'completed',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await billingAPI.getInvoiceById(parseInt(id));
        setInvoice(response.data);
        setPaymentData((prev: Partial<Payment>) => ({
          ...prev,
          amount: response.data.total_amount,
          invoice_id: response.data.id,
        }));
      } catch (err) {
        setError('Failed to fetch invoice details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !invoice) {
      setError('Invalid invoice');
      return;
    }

    if (paymentData.amount && paymentData.amount > invoice.total_amount) {
      setError('Payment amount cannot exceed invoice total');
      return;
    }

    try {
      setLoading(true);
      await billingAPI.recordPayment({
        ...paymentData,
        invoice_id: parseInt(id),
      });
      navigate('/billing/invoices');
    } catch (err) {
      setError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invoice) {
    return <LoadingScreen />;
  }

  if (!invoice) {
    return (
      <Box p={3}>
        <Alert severity="error">Invoice not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Record Payment
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box mb={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">{invoice.invoice_number}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography variant="body1">{invoice.patient.full_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="body1">${invoice.total_amount.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Payment Date"
                value={paymentData.date ? new Date(paymentData.date) : null}
                onChange={(date) =>
                  setPaymentData((prev: Partial<Payment>) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) =>
                  setPaymentData((prev: Partial<Payment>) => ({
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
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentData.payment_method || 'cash'}
                  onChange={(e) =>
                    setPaymentData((prev: Partial<Payment>) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={paymentData.status || 'completed'}
                  onChange={(e) =>
                    setPaymentData((prev: Partial<Payment>) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  label="Status"
                >
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentData.reference_number || ''}
                onChange={(e) =>
                  setPaymentData((prev: Partial<Payment>) => ({
                    ...prev,
                    reference_number: e.target.value,
                  }))
                }
                helperText="Transaction ID, Check number, or other reference"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={paymentData.notes || ''}
                onChange={(e) =>
                  setPaymentData((prev: Partial<Payment>) => ({
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
                <Button variant="outlined" onClick={() => navigate('/billing/invoices')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Record Payment
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PaymentForm;
