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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { labAPI } from '../../services/api';
import { LabOrder } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const LabOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLabOrders, setTotalLabOrders] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      const response = await labAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
      });
      setLabOrders(response.data.data);
      setTotalLabOrders(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lab orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddLabOrder = () => {
    navigate('/clinical/lab/new');
  };

  const handleEditLabOrder = (labOrder: LabOrder) => {
    navigate(`/clinical/lab/${labOrder.id}/edit`);
  };

  const handleViewLabOrder = (labOrder: LabOrder) => {
    navigate(`/clinical/lab/${labOrder.id}`);
  };

  const handleUpdateResults = (labOrder: LabOrder) => {
    navigate(`/clinical/lab/${labOrder.id}/results`);
  };

  const handleDeleteClick = (labOrder: LabOrder) => {
    setSelectedLabOrder(labOrder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLabOrder?.id) return;

    try {
      await labAPI.delete(selectedLabOrder.id);
      fetchLabOrders();
      setDeleteDialogOpen(false);
      setSelectedLabOrder(null);
    } catch (err) {
      setError('Failed to delete lab order. Please try again later.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && labOrders.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Lab Orders
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddLabOrder}
        >
          New Lab Order
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search lab orders..."
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
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Tests</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labOrders.map((labOrder) => (
                <TableRow key={labOrder.id}>
                  <TableCell>{new Date(labOrder.date).toLocaleDateString()}</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>
                    {labOrder.tests.map((test: { testId: number; test?: LabTest; result?: string; status: 'pending' | 'completed' | 'cancelled'; name: string }, index: number) => (
                      <Chip
                        key={index}
                        label={test.name}
                        color={getStatusColor(test.status)}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {labOrder.tests.every((test) => test.status === 'completed') ? (
                      <Chip label="Completed" color="success" />
                    ) : labOrder.tests.some((test) => test.status === 'pending') ? (
                      <Chip label="Pending" color="warning" />
                    ) : (
                      <Chip label="Cancelled" color="error" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewLabOrder(labOrder)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Results">
                      <IconButton
                        onClick={() => handleUpdateResults(labOrder)}
                        disabled={!labOrder.tests.some((test) => test.status === 'pending')}
                      >
                        <ScienceIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditLabOrder(labOrder)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(labOrder)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalLabOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lab order? This action cannot be undone.
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

export default LabOrderList;
