export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  instructions: string;
  patientId: number;
  prescribedBy: number;
  active: boolean;
}

export interface MedicationReminder {
  id: number;
  medicationId: number;
  patientId: number;
  scheduledTime: string;
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'MISSED';
  type: 'SMS' | 'EMAIL' | 'PUSH';
}

export interface CreateMedicationDTO {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  instructions: string;
  patientId: number;
  prescribedBy: number;
  reminderPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UpdateMedicationDTO extends Partial<CreateMedicationDTO> {
  id: number;
}
