import { apiClient } from './api/client';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'APPOINTMENT' | 'MEDICATION' | 'PAYMENT' | 'SYSTEM';
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

class NotificationService {
  private readonly basePath = '/notifications';

  async sendAppointmentReminder(appointmentId: number, type: 'EMAIL' | 'SMS' | 'PUSH') {
    return apiClient.post(`${this.basePath}/appointment-reminder`, {
      appointmentId,
      type,
    });
  }

  async updatePreferences(userId: number, preferences: NotificationPreferences) {
    return apiClient.put(`${this.basePath}/preferences/${userId}`, preferences);
  }

  async getNotifications(userId: number, page = 1, limit = 10) {
    return apiClient.get<Notification[]>(`${this.basePath}/user/${userId}`, {
      params: { page, limit },
    });
  }

  async markAsRead(notificationId: number) {
    return apiClient.put(`${this.basePath}/${notificationId}/read`);
  }
}

export const notificationService = new NotificationService();
