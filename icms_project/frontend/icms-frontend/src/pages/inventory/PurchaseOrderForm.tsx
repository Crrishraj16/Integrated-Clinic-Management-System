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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { PurchaseOrder, InventoryItem } from '../../types';
import type { PaginationParams } from '../../services/api';
import { inventoryAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface PurchaseOrderItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const PurchaseOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [orderData, setOrderData] = useState<Partial<PurchaseOrder>>({
    date: new Date().toISOString(),
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    status: 'draft',
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    totalAmount: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch inventory items
        const itemsResponse = await inventoryAPI.getAll();
        setItems(itemsResponse.data.data);

        // Fetch suppliers
        const suppliersResponse = await inventoryAPI.getAll({ type: 'supplier' } as PaginationParams);
        setSuppliers(suppliersResponse.data);

        // If editing, fetch order details
        if (isEdit && id) {
          const orderResponse = await inventoryAPI.getById(parseInt(id));
          setOrderData(orderResponse.data);
        } else if (location.state?.item) {
          // If creating new order from inventory item
          const item = location.state.item;
          setOrderData((prev) => ({
            ...prev,
            supplierId: item.supplierId,
            items: [
              {
                itemId: item.id,
                itemName: item.name,
                quantity: 1,
                unitPrice: item.unitPrice || 0,
                total: item.unitPrice || 0,
              },
            ],
          }));
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

  const handleAddItem = () => {
    setOrderData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          itemId: 0,
          itemName: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items?.filter((_: PurchaseOrderItem, i: number) => i !== index),
    }));
    updateTotals();
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setOrderData((prev: Partial<PurchaseOrder>) => {
      const updatedItems = [...(prev.items || [])];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      if (field === 'itemId') {
        const item = items.find((i) => i.id === value);
        if (item) {
          updatedItems[index] = {
            ...updatedItems[index],
            itemName: item.name,
            unitPrice: item.unitPrice || 0,
          };
        }
      }

      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;

      return {
        ...prev,
        items: updatedItems,
      };
    });
    updateTotals();
  };

  const updateTotals = () => {
    setOrderData((prev: Partial<PurchaseOrder>) => {
      const items = prev.items || [];
      const subtotal = items.reduce((sum: number, item: PurchaseOrderItem) => sum + item.total, 0);
      const taxAmount = (subtotal * (prev.tax || 0)) / 100;
      const total = subtotal + taxAmount + (prev.shipping || 0);

      return {
        ...prev,
        subtotal,
        totalAmount: total,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderData.supplierId) {
      setError('Please select a supplier');
      return;
    }

    if (!orderData.items?.length) {
      setError('Please add at least one item to the order');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await inventoryAPI.update(parseInt(id), orderData as InventoryItem);
      } else {
        await inventoryAPI.create(orderData as InventoryItem);
      }
      navigate('/inventory/orders');
    } catch (err) {
      setError('Failed to save purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !orderData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={orderData.supplierId || ''}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                    setOrderData((prev: Partial<PurchaseOrder>) => ({
                      ...prev,
                      supplierId: e.target.value as number,
                    }))
                  }
                  label="Supplier"
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Number"
                value={orderData.id || ''}
                disabled
                helperText="Auto-generated on save"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Order Date"
                value={orderData.date ? new Date(orderData.date) : null}
                onChange={(date) =>
                  setOrderData((prev) => ({
                    ...prev,
                    date: date?.toISOString() || new Date().toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Expected Delivery"
                value={
                  orderData.expectedDelivery
                    ? new Date(orderData.expectedDelivery)
                    : null
                }
                onChange={(date) =>
                  setOrderData((prev) => ({
                    ...prev,
                    expectedDelivery: date?.toISOString(),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Order Items</Typography>
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
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderData.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth>
                            <Select
                              value={item.itemId}
                              onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                                handleItemChange(index, 'itemId', e.target.value as number)
                              }
                              required
                            >
                              {items.map((invItem) => (
                                <MenuItem key={invItem.id} value={invItem.id}>
                                  {invItem.name}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={orderData.status || 'draft'}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                    setOrderData((prev: Partial<PurchaseOrder>) => ({
                      ...prev,
                      status: e.target.value as PurchaseOrder['status'],
                    }))
                  }
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="ordered">Ordered</MenuItem>
                  <MenuItem value="received">Received</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax (%)"
                type="number"
                value={orderData.tax || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOrderData((prev: Partial<PurchaseOrder>) => ({
                    ...prev,
                    tax: parseFloat(e.target.value),
                  }))
                }
                inputProps={{ min: 0, max: 100 }}
                onBlur={updateTotals}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shipping"
                type="number"
                value={orderData.shipping || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOrderData((prev: Partial<PurchaseOrder>) => ({
                    ...prev,
                    shipping: parseFloat(e.target.value),
                  }))
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                onBlur={updateTotals}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={orderData.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOrderData((prev: Partial<PurchaseOrder>) => ({
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
                  Subtotal: ${orderData.subtotal?.toFixed(2) || '0.00'}
                </Typography>
                <Typography>
                  Tax: ${(
                    ((orderData.subtotal || 0) * (orderData.tax || 0)) /
                    100
                  ).toFixed(2)}
                </Typography>
                <Typography>
                  Shipping: ${orderData.shipping?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="h6">
                  Total: ${orderData.totalAmount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/inventory/orders')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Order
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PurchaseOrderForm;
