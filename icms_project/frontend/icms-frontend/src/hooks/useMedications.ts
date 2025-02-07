import { useState, useCallback } from 'react';
import { useAsync } from './useAsync';
import { medicationService } from '../services/api/medications';
import { Medication, CreateMedicationDTO, UpdateMedicationDTO } from '../types/medication';
import { useNotifications } from '../context/AppContext';

export const useMedications = (patientId?: number) => {
  const { addNotification } = useNotifications();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    data: medications,
    loading,
    error,
  } = useAsync<Medication[]>(
    () => (patientId ? medicationService.getPatientMedications(patientId) : Promise.resolve([])),
    [patientId, refreshTrigger]
  );

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const createMedication = useCallback(
    async (data: CreateMedicationDTO) => {
      try {
        const result = await medicationService.createMedication(data);
        addNotification({
          type: 'success',
          message: 'Medication created successfully',
        });
        refresh();
        return result;
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to create medication',
        });
        throw error;
      }
    },
    [addNotification, refresh]
  );

  const updateMedication = useCallback(
    async (data: UpdateMedicationDTO) => {
      try {
        const result = await medicationService.updateMedication(data);
        addNotification({
          type: 'success',
          message: 'Medication updated successfully',
        });
        refresh();
        return result;
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to update medication',
        });
        throw error;
      }
    },
    [addNotification, refresh]
  );

  const deleteMedication = useCallback(
    async (id: number) => {
      try {
        await medicationService.deleteMedication(id);
        addNotification({
          type: 'success',
          message: 'Medication deleted successfully',
        });
        refresh();
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to delete medication',
        });
        throw error;
      }
    },
    [addNotification, refresh]
  );

  return {
    medications,
    loading,
    error,
    createMedication,
    updateMedication,
    deleteMedication,
    refresh,
  };
};
