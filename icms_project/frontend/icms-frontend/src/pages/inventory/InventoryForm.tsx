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
import { InventoryItem } from '../../types';
import { inventoryAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const categories = [
  'Medications',
  'Medical Supplies',
  'Laboratory Supplies',
  'Equipment',
  'Office Supplies',
  'Other',
];

const units = [
  'Pieces',
  'Boxes',
  'Bottles',
  'Tablets',
  'Capsules',
  'Ampules',
  'Vials',
  'Milliliters',
  'Grams',
  'Units',
];

const InventoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [itemData, setItemData] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: '',
    unit_price: 0,
    reorder_point: 0,
    location: '',
    supplier_id: null,
    expiry_date: null,
    batch_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch suppliers
        const suppliersResponse = await inventoryAPI.getSuppliers();
        setSuppliers(suppliersResponse.data);

        // If editing, fetch item details
        if (isEdit && id) {
          const itemResponse = await inventoryAPI.getById(parseInt(id));
          setItemData(itemResponse.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemData.name || !itemData.category || !itemData.unit) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await inventoryAPI.update(parseInt(id), itemData);
      } else {
        await inventoryAPI.create(itemData);
      }
      navigate('/inventory/items');
    } catch (err) {
      setError('Failed to save inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !itemData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Inventory Item' : 'New Inventory Item'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={itemData.name || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemData.category || ''}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={itemData.description || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={itemData.quantity || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value),
                  }))
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={itemData.unit || ''}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={itemData.unit_price || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    unit_price: parseFloat(e.target.value),
                  }))
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={itemData.reorder_point || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    reorder_point: parseInt(e.target.value),
                  }))
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={itemData.location || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                helperText="Storage location in the facility"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={itemData.supplier_id || ''}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      supplier_id: e.target.value,
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
              <DatePicker
                label="Expiry Date"
                value={itemData.expiry_date ? new Date(itemData.expiry_date) : null}
                onChange={(date) =>
                  setItemData((prev) => ({
                    ...prev,
                    expiry_date: date?.toISOString() || null,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                value={itemData.batch_number || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
                    ...prev,
                    batch_number: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={itemData.notes || ''}
                onChange={(e) =>
                  setItemData((prev) => ({
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
                <Button variant="outlined" onClick={() => navigate('/inventory/items')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Item
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default InventoryForm;
