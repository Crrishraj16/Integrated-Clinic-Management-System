import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vaccinationAPI, patientAPI, PaginationParams } from '../../services/api';
import { Vaccination, Patient, EntityStatus } from '../../types';

const VaccinationList: React.FC = () => {
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [patients, setPatients] = useState<{ [key: number]: Patient }>({});
  const [totalVaccinations, setTotalVaccinations] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchVaccinations = async (params: PaginationParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vaccinationAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        ...params
      });

      const { data, total } = response.data;
      setVaccinations(data);
      setTotalVaccinations(total);

      // Fetch patient details for each vaccination
      const patientIds = [...new Set(data.map(v => v.patientId))];
      const patientsData = await Promise.all(
        patientIds.map(id => patientAPI.getById(id))
      );

      const patientMap = patientsData.reduce((acc, patient) => {
        acc[patient.data.id] = patient.data;
        return acc;
      }, {} as { [key: number]: Patient });

      setPatients(patientMap);
    } catch (err) {
      console.error('Failed to fetch vaccinations', err);
      setError('Failed to load vaccinations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (vaccination: Vaccination) => {
    navigate(`/clinical/vaccinations/edit/${vaccination.id}`);
  };

  const handleDeleteConfirmation = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedVaccination) {
      try {
        await vaccinationAPI.delete(selectedVaccination.id);
        fetchVaccinations();
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete vaccination', error);
        setError('Failed to delete vaccination. Please try again.');
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedVaccination(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Vaccinations
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/clinical/vaccinations/new')}
        sx={{ mb: 2 }}
      >
        Add New Vaccination
      </Button>

      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Vaccine Type</TableCell>
              <TableCell>Dose Number</TableCell>
              <TableCell>Administered Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vaccinations.map((vaccination) => (
              <TableRow key={vaccination.id}>
                <TableCell>
                  {patients[vaccination.patientId]?.firstName} {' '}
                  {patients[vaccination.patientId]?.lastName}
                </TableCell>
                <TableCell>{vaccination.vaccineType}</TableCell>
                <TableCell>{vaccination.doseNumber}</TableCell>
                <TableCell>{new Date(vaccination.administeredDate).toLocaleDateString()}</TableCell>
                <TableCell>{vaccination.status}</TableCell>
                <TableCell>
                  <Button 
                    startIcon={<Edit />} 
                    onClick={() => handleEdit(vaccination)}
                  >
                    Edit
                  </Button>
                  <Button 
                    color="error" 
                    startIcon={<Delete />} 
                    onClick={() => handleDeleteConfirmation(vaccination)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalVaccinations}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vaccination record? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VaccinationList;
