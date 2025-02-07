import { apiClient } from './client';
import { Medication, MedicationReminder, CreateMedicationDTO, UpdateMedicationDTO } from '../../types/medication';

class MedicationService {
  private readonly basePath = '/medications';

  async createMedication(data: CreateMedicationDTO) {
    return apiClient.post<Medication>(this.basePath, data);
  }

  async updateMedication(data: UpdateMedicationDTO) {
    return apiClient.put<Medication>(`${this.basePath}/${data.id}`, data);
  }

  async getMedication(id: number) {
    return apiClient.get<Medication>(`${this.basePath}/${id}`);
  }

  async getPatientMedications(patientId: number, active?: boolean) {
    return apiClient.get<Medication[]>(`${this.basePath}/patient/${patientId}`, {
      params: { active },
    });
  }

  async getMedicationReminders(medicationId: number) {
    return apiClient.get<MedicationReminder[]>(`${this.basePath}/${medicationId}/reminders`);
  }

  async createReminder(medicationId: number, scheduledTime: string, type: 'SMS' | 'EMAIL' | 'PUSH') {
    return apiClient.post<MedicationReminder>(`${this.basePath}/${medicationId}/reminders`, {
      scheduledTime,
      type,
    });
  }

  async acknowledgeReminder(reminderId: number) {
    return apiClient.put<MedicationReminder>(`${this.basePath}/reminders/${reminderId}/acknowledge`);
  }

  async deleteMedication(id: number) {
    return apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const medicationService = new MedicationService();
