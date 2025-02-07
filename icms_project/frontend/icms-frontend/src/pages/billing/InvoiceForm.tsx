import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Invoice, Patient, Service } from '../../types';
import { billingAPI } from '../../services/api/billing';
import { patientAPI, serviceAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface InvoiceFormItem {
  serviceId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

const calculateItemTotal = (item: InvoiceFormItem) => {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = (subtotal * item.discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * item.tax) / 100;
  return subtotal - discountAmount + taxAmount;
};

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<InvoiceFormItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [invoiceData, setInvoiceData] = useState<Partial<Invoice>>({
    dateTime: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'pending',
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patients
        const patientsResponse = await patientAPI.getAll();
        setPatients(patientsResponse.data.data);

        // Fetch services
        const servicesResponse = await serviceAPI.getAll();
        setServices(servicesResponse.data.data);

        // If editing, fetch invoice details
        if (isEdit && id) {
          const invoiceResponse = await billingAPI.getInvoiceById(parseInt(id));
          setInvoiceData(invoiceResponse.data);

          // Set selected patient
          const patient = patientsResponse.data.data.find(
            (p) => p.id === invoiceResponse.data.patient_id
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
  }, [id, isEdit]);

  const handleAddItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          serviceId: 0,
          serviceName: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          tax: 0,
          total: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
    updateTotals();
  };

  const handleItemChange = (index: number, field: keyof InvoiceFormItem, value: any) => {
    setInvoiceData((prev) => {
      const updatedItems = [...(prev.items || [])];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      if (field === 'serviceId') {
        const service = services.find((s) => s.id === value);
        if (service) {
          updatedItems[index] = {
            ...updatedItems[index],
            serviceName: service.name,
            unitPrice: service.cost,
          };
        }
      }

      updatedItems[index].total = calculateItemTotal(updatedItems[index]);

      return {
        ...prev,
        items: updatedItems,
      };
    });
    updateTotals();
  };

  const updateTotals = () => {
    setInvoiceData((prev) => {
      const items = prev.items || [];
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = (subtotal * (prev.discount || 0)) / 100;
      const taxAmount = ((subtotal - discountAmount) * (prev.tax || 0)) / 100;
      const total = subtotal - discountAmount + taxAmount;

      return {
        ...prev,
        subtotal,
        total_amount: total,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (!invoiceData.items?.length) {
      setError('Please add at least one item to the invoice');
      return;
    }

    const invoicePayload = {
      ...invoiceData,
      patient_id: selectedPatient.id,
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await billingAPI.updateInvoice(parseInt(id), invoicePayload);
      } else {
        await billingAPI.createInvoice(invoicePayload);
      }
      navigate('/billing/invoices');
    } catch (err) {
      setError('Failed to save invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invoiceData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Invoice' : 'New Invoice'}
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
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoiceData.invoice_number || ''}
                disabled
                helperText="Auto-generated on save"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Invoice Date"
                value={invoiceData.date ? new Date(invoiceData.date) : null}
                onChange={(date) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={invoiceData.due_date ? new Date(invoiceData.due_date) : null}
                onChange={(date) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    due_date: date?.toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Invoice Items</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Discount (%)</TableCell>
                      <TableCell>Tax (%)</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth>
                            <Select
                              value={item.service_id}
                              onChange={(e) =>
                                handleItemChange(index, 'service_id', e.target.value)
                              }
                              required
                            >
                              {services.map((service) => (
                                <MenuItem key={service.id} value={service.id}>
                                  {service.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value))
                            }
                            inputProps={{ min: 1 }}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'unit_price',
                                parseFloat(e.target.value)
                              )
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                              ),
                            }}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'discount',
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.tax}
                            onChange={(e) =>
                              handleItemChange(index, 'tax', parseFloat(e.target.value))
                            }
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell>${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Terms</InputLabel>
                <Select
                  value={invoiceData.payment_terms || 'net30'}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      payment_terms: e.target.value,
                    }))
                  }
                  label="Payment Terms"
                >
                  <MenuItem value="immediate">Due Immediately</MenuItem>
                  <MenuItem value="net15">Net 15</MenuItem>
                  <MenuItem value="net30">Net 30</MenuItem>
                  <MenuItem value="net60">Net 60</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={invoiceData.status || 'pending'}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={invoiceData.notes || ''}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
                gap={1}
                mt={2}
              >
                <Typography>
                  Subtotal: ${invoiceData.subtotal?.toFixed(2) || '0.00'}
                </Typography>
                <Typography>
                  Discount: ${(
                    ((invoiceData.subtotal || 0) * (invoiceData.discount || 0)) /
                    100
                  ).toFixed(2)}
                </Typography>
                <Typography>
                  Tax: ${(
                    ((invoiceData.subtotal || 0) * (invoiceData.tax || 0)) /
                    100
                  ).toFixed(2)}
                </Typography>
                <Typography variant="h6">
                  Total: ${invoiceData.total_amount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
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
                  {isEdit ? 'Update' : 'Create'} Invoice
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default InvoiceForm;
