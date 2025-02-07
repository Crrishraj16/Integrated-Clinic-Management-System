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
  Vaccines as VaccineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vaccinationAPI } from '../../services/api';
import { Vaccination } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const VaccinationList: React.FC = () => {
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalVaccinations, setTotalVaccinations] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const response = await vaccinationAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setVaccinations(response.data.data);
      setTotalVaccinations(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch vaccinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [page, rowsPerPage, searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddVaccination = () => {
    navigate('/clinical/vaccinations/new');
  };

  const handleEditVaccination = (vaccination: Vaccination) => {
    navigate(`/clinical/vaccinations/${vaccination.id}/edit`);
  };

  const handleViewVaccination = (vaccination: Vaccination) => {
    navigate(`/clinical/vaccinations/${vaccination.id}`);
  };

  const handleDeleteClick = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVaccination?.id) return;

    try {
      await vaccinationAPI.delete(selectedVaccination.id);
      fetchVaccinations();
      setDeleteDialogOpen(false);
      setSelectedVaccination(null);
    } catch (err) {
      setError('Failed to delete vaccination record. Please try again later.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'primary';
    }
  };

  if (loading && vaccinations.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vaccination Records
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVaccination}
        >
          New Vaccination Record
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search vaccinations..."
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
                <TableCell>Vaccine</TableCell>
                <TableCell>Dose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Next Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccinations.map((vaccination) => (
                <TableRow key={vaccination.id}>
                  <TableCell>{new Date(vaccination.date).toLocaleDateString()}</TableCell>
                  <TableCell>{vaccination.patient.full_name}</TableCell>
                  <TableCell>{vaccination.vaccine_name}</TableCell>
                  <TableCell>{vaccination.dose_number}</TableCell>
                  <TableCell>
                    <Chip
                      label={vaccination.status}
                      color={getStatusColor(vaccination.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vaccination.next_due_date
                      ? new Date(vaccination.next_due_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewVaccination(vaccination)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditVaccination(vaccination)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(vaccination)}>
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
          count={totalVaccinations}
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
            Are you sure you want to delete this vaccination record? This action cannot be
            undone.
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

export default VaccinationList;
