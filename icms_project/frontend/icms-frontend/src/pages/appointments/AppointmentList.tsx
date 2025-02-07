import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Appointment, Patient, User } from '../../types';
import { appointmentAPI, patientAPI, userAPI } from '../../services/api';
import ErrorAlert from '../../components/ErrorAlert';

interface AppointmentWithDetails {
  id: number;
  dateTime: string;
  type: 'regular' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  roomNumber: string;
  patientId: number;
  doctorId: number;
  notes?: string;
  patient?: Patient;
  doctor?: User;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  time?: string;
}

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
      });

      // Fetch patient and doctor details for each appointment
      const appointmentsWithDetails = await Promise.all(
        response.data.data.map(async (appointment: Appointment) => {
          const [patientRes, doctorRes] = await Promise.all([
            patientAPI.getById(appointment.patientId),
            userAPI.getById(appointment.doctorId),
          ]);
          return {
            ...appointment,
            patient: patientRes.data,
            doctor: doctorRes.data,
          };
        })
      );

      setAppointments(appointmentsWithDetails);
      setTotalCount(response.data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        await appointmentAPI.delete(id);
        fetchAppointments();
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !appointments.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Appointments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/new')}
        >
          New Appointment
        </Button>
      </Box>

      {error && <ErrorAlert message={error} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Room</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {format(new Date(appointment.dateTime), 'PPp')}
                </TableCell>
                <TableCell>
                  {appointment.patient?.name}
                </TableCell>
                <TableCell>
                  {appointment.doctor?.name}
                </TableCell>
                <TableCell>
                  <Chip
                    label={appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                    color={appointment.type === 'emergency' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    color={
                      appointment.status === 'completed'
                        ? 'success'
                        : appointment.status === 'cancelled'
                        ? 'error'
                        : 'primary'
                    }
                  />
                </TableCell>
                <TableCell>{appointment.roomNumber}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(appointment.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default AppointmentList;
