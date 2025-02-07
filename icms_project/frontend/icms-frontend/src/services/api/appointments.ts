import { apiClient } from './client';
import { Appointment, AppointmentStatus } from '../../types';

export interface CreateAppointmentDTO {
  patientId: number;
  doctorId: number;
  dateTime: string;
  type: 'regular' | 'emergency' | 'followup';
  status: AppointmentStatus;
  roomNumber: string;
  notes?: string;
}

export interface UpdateAppointmentDTO extends Partial<CreateAppointmentDTO> {
  id: number;
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  patientId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
  type?: string;
  page?: number;
  limit?: number;
}

class AppointmentService {
  private readonly basePath = '/appointments';

  async getAll(filters?: AppointmentFilters) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    const url = query ? `${this.basePath}?${query}` : this.basePath;
    return apiClient.get<Appointment[]>(url);
  }

  async getById(id: number) {
    return apiClient.get<Appointment>(`${this.basePath}/${id}`);
  }

  async create(data: CreateAppointmentDTO) {
    return apiClient.post<Appointment>(this.basePath, data);
  }

  async update(data: UpdateAppointmentDTO) {
    const { id, ...updateData } = data;
    return apiClient.put<Appointment>(`${this.basePath}/${id}`, updateData);
  }

  async delete(id: number) {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async updateStatus(id: number, status: AppointmentStatus) {
    return apiClient.patch<Appointment>(`${this.basePath}/${id}/status`, {
      status,
    });
  }

  async getAvailableSlots(doctorId: number, date: string) {
    return apiClient.get<string[]>(
      `${this.basePath}/available-slots?doctorId=${doctorId}&date=${date}`
    );
  }

  async checkConflicts(doctorId: number, dateTime: string, excludeId?: number) {
    const url = new URL(`${this.basePath}/check-conflicts`, window.location.origin);
    url.searchParams.append('doctorId', doctorId.toString());
    url.searchParams.append('dateTime', dateTime);
    if (excludeId) {
      url.searchParams.append('excludeId', excludeId.toString());
    }
    return apiClient.get<{ hasConflict: boolean }>(url.pathname + url.search);
  }

  async reschedule(id: number, newDateTime: string) {
    return apiClient.patch<Appointment>(`${this.basePath}/${id}/reschedule`, {
      dateTime: newDateTime,
    });
  }

  async cancel(id: number, reason?: string) {
    return apiClient.patch<Appointment>(`${this.basePath}/${id}/cancel`, {
      reason,
    });
  }
}

export const appointmentService = new AppointmentService();
