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
import { Invoice, InvoiceStatus, Patient, Service, PaymentMethod, PaymentStatus, BaseEntity } from '../../types';
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
  service?: Service;
}

interface InvoiceFormData {
  patientId: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: InvoiceFormItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  invoiceNumber?: string;
  paymentTerms?: string;
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    patientId: 0,
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'draft' as InvoiceStatus,
    paymentStatus: 'pending' as PaymentStatus,
    paymentMethod: 'cash' as PaymentMethod,
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: '',
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
            (p) => p.id === invoiceResponse.data.patientId
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
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    const newItem: InvoiceFormItem = {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      quantity: 1,
      unitPrice: selectedService.price || 0,
      discount: 0,
      tax: 0,
      total: selectedService.price || 0,
      service: selectedService,
    };

    setInvoiceData((prev) => {
      const items = [...prev.items, newItem];
      return {
        ...prev,
        items,
        subtotal: items.reduce((sum, item) => sum + item.total, 0),
      };
    });

    setSelectedService(null);
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceData((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const totalDiscount = items.reduce((sum, item) => sum + (item.total * item.discount / 100), 0);
      const totalTax = items.reduce((sum, item) => sum + (item.total * item.tax / 100), 0);

      return {
        ...prev,
        items,
        subtotal,
        discount: totalDiscount,
        tax: totalTax,
        total: subtotal - totalDiscount + totalTax,
      };
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceFormItem, value: any) => {
    setInvoiceData((prev) => {
      const updatedItems = [...prev.items];
      if (updatedItems[index]) {
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItems[index][field] = parseFloat(value) || 0;
        } else {
          updatedItems[index][field] = value;
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
      patientId: selectedPatient.id,
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
                getOptionLabel={(option) => option.fullName}
                renderInput={(params) => <TextField {...params} label="Patient" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoiceData.invoiceNumber || ''}
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
                              value={item.serviceId}
                              onChange={(e) =>
                                handleItemChange(index, 'serviceId', e.target.value)
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
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'unitPrice',
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
                  value={invoiceData.paymentTerms || 'net30'}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value,
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
                  Total: ${invoiceData.total?.toFixed(2) || '0.00'}
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
