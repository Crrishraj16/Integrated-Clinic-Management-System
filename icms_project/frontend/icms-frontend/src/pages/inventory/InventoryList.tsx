import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  ShoppingCart as OrderIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import { InventoryItem } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemForMenu, setSelectedItemForMenu] = useState<InventoryItem | null>(
    null
  );

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setItems(response.data.data);
      setTotalItems(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, rowsPerPage, searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddItem = () => {
    navigate('/inventory/items/new');
  };

  const handleEditItem = (item: InventoryItem) => {
    navigate(`/inventory/items/${item.id}/edit`);
  };

  const handleViewItem = (item: InventoryItem) => {
    navigate(`/inventory/items/${item.id}`);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem?.id) return;

    try {
      await inventoryAPI.delete(selectedItem.id);
      fetchInventory();
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setError('Failed to delete item. Please try again later.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: InventoryItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemForMenu(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemForMenu(null);
  };

  const handleCreateOrder = (item: InventoryItem) => {
    navigate('/inventory/orders/new', { state: { item } });
    handleMenuClose();
  };

  const getStockLevelColor = (quantity: number, reorderPoint: number) => {
    if (quantity <= 0) return 'error';
    if (quantity <= reorderPoint) return 'warning';
    return 'success';
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return { color: 'error', label: 'Expired' };
    if (daysUntilExpiry <= 30) return { color: 'warning', label: 'Expiring Soon' };
    return null;
  };

  if (loading && items.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {error && (
          <Box p={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock Level</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const expiryStatus = getExpiryStatus(item.expiry_date);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.quantity} ${item.unit}`}
                        color={getStockLevelColor(item.quantity, item.reorder_point)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {expiryStatus && (
                        <Chip
                          label={expiryStatus.label}
                          color={expiryStatus.color}
                          size="small"
                          icon={<WarningIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewItem(item)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditItem(item)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton onClick={(e) => handleMenuOpen(e, item)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => selectedItemForMenu && handleCreateOrder(selectedItemForMenu)}
        >
          <OrderIcon sx={{ mr: 1 }} /> Create Purchase Order
        </MenuItem>
        <MenuItem
          onClick={() => selectedItemForMenu && handleDeleteClick(selectedItemForMenu)}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete Item
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryList;
