import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useNotifications } from '../context/AppContext';
import { appointmentService, AppointmentFilters } from '../services/api/appointments';
import { Appointment } from '../types';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>;
  createAppointment: (data: any) => Promise<void>;
  updateAppointment: (id: number, data: any) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
  checkConflicts: (doctorId: number, dateTime: string, excludeId?: number) => Promise<boolean>;
  getAvailableSlots: (doctorId: number, date: Date) => Promise<string[]>;
}

export const useAppointments = (initialFilters?: AppointmentFilters): UseAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { addNotification } = useNotifications();

  const fetchAppointments = useCallback(async (filters?: AppointmentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAll(filters);
      setAppointments(response);
      setTotalCount(response.length);
    } catch (err) {
      setError(err as Error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch appointments',
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createAppointment = async (data: any) => {
    setLoading(true);
    try {
      const response = await appointmentService.create(data);
      setAppointments((prev) => [...prev, response]);
      addNotification({
        type: 'success',
        message: 'Appointment created successfully',
      });
      return response;
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to create appointment',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: number, data: any) => {
    setLoading(true);
    try {
      const response = await appointmentService.update({ id, ...data });
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? response : appointment
        )
      );
      addNotification({
        type: 'success',
        message: 'Appointment updated successfully',
      });
      return response;
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update appointment',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: number) => {
    setLoading(true);
    try {
      await appointmentService.delete(id);
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== id)
      );
      addNotification({
        type: 'success',
        message: 'Appointment deleted successfully',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to delete appointment',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async (
    doctorId: number,
    dateTime: string,
    excludeId?: number
  ) => {
    try {
      const { hasConflict } = await appointmentService.checkConflicts(
        doctorId,
        dateTime,
        excludeId
      );
      return hasConflict;
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to check appointment conflicts',
      });
      throw err;
    }
  };

  const getAvailableSlots = async (doctorId: number, date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      return await appointmentService.getAvailableSlots(doctorId, formattedDate);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to fetch available slots',
      });
      throw err;
    }
  };

  useEffect(() => {
    if (initialFilters) {
      fetchAppointments(initialFilters);
    }
  }, [fetchAppointments, initialFilters]);

  return {
    appointments,
    loading,
    error,
    totalCount,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    checkConflicts,
    getAvailableSlots,
  };
};
