import axios from 'axios';
import config from '../config';
import { 
  User, 
  Patient, 
  Appointment, 
  Service, 
  Invoice,
  Payment,
  InsuranceClaim,
  LabOrder,
  LabTest,
  LabResult,
  Prescription,
  Medication,
  Chat,
  Message
} from '../types';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Partial<User>) => api.post('/auth/register', data),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

// User API
interface UserParams extends PaginationParams {
  role?: string;
}

export const userAPI = {
  getAll: (params?: UserParams) => api.get<PaginatedResponse<User>>('/users', { params }),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Patient API
export const patientAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Patient>>('/patients', { params }),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  create: (data: Partial<Patient>) => api.post<Patient>('/patients', data),
  update: (id: number, data: Partial<Patient>) => api.put<Patient>(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Appointment>>('/appointments', { params }),
  getById: (id: number) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Partial<Appointment>) => api.post<Appointment>('/appointments', data),
  update: (id: number, data: Partial<Appointment>) => api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  getByPatient: (patientId: number) => api.get<Appointment[]>(`/appointments/patient/${patientId}`),
};

// Service API
export const serviceAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Service>>('/services', { params }),
  getById: (id: number) => api.get<Service>(`/services/${id}`),
  create: (data: Partial<Service>) => api.post<Service>('/services', data),
  update: (id: number, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
};

// Invoice API
export const billingAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Invoice>>('/invoices', { params }),
  getById: (id: number) => api.get<Invoice>(`/invoices/${id}`),
  create: (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data),
  update: (id: number, data: Partial<Invoice>) => api.put<Invoice>(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  processPayment: (id: number, paymentData: { amount: number; method: string }) =>
    api.post<Payment>(`/invoices/${id}/payments`, paymentData),
};

// Payment API
export const paymentAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Payment>>('/payments', { params }),
  getById: (id: number) => api.get<Payment>(`/payments/${id}`),
  create: (data: Partial<Payment>) => api.post<Payment>('/payments', data),
  update: (id: number, data: Partial<Payment>) => api.put<Payment>(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

// Insurance Claim API
export const claimsAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<InsuranceClaim>>('/insurance-claims', { params }),
  getById: (id: number) => api.get<InsuranceClaim>(`/insurance-claims/${id}`),
  create: (data: Partial<InsuranceClaim>) => api.post<InsuranceClaim>('/insurance-claims', data),
  update: (id: number, data: Partial<InsuranceClaim>) => api.put<InsuranceClaim>(`/insurance-claims/${id}`, data),
  delete: (id: number) => api.delete(`/insurance-claims/${id}`),
  submit: (id: number) =>
    api.post<InsuranceClaim>(`/insurance-claims/${id}/submit`),
};

// Lab API
export const labAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<LabOrder>>('/lab-orders', { params }),
  getById: (id: number) => api.get<LabOrder>(`/lab-orders/${id}`),
  create: (data: Partial<LabOrder>) => api.post<LabOrder>('/lab-orders', data),
  update: (id: number, data: Partial<LabOrder>) => api.put<LabOrder>(`/lab-orders/${id}`, data),
  delete: (id: number) => api.delete(`/lab-orders/${id}`),
  getTests: () =>
    api.get<{ data: LabTest[]; total: number }>('/lab/tests'),
  getTestById: (id: number) =>
    api.get<LabTest>(`/lab/tests/${id}`),
  addResult: (orderId: number, resultData: LabResult) =>
    api.post<LabResult>(`/lab-orders/${orderId}/results`, resultData),
};

// Prescription API
export const prescriptionAPI = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Prescription>>('/prescriptions', { params }),
  getById: (id: number) => api.get<Prescription>(`/prescriptions/${id}`),
  create: (data: Partial<Prescription>) => api.post<Prescription>('/prescriptions', data),
  update: (id: number, data: Partial<Prescription>) => api.put<Prescription>(`/prescriptions/${id}`, data),
  delete: (id: number) => api.delete(`/prescriptions/${id}`),
  getMedications: () =>
    api.get<{ data: Medication[]; total: number }>('/medications'),
  getMedicationById: (id: number) =>
    api.get<Medication>(`/medications/${id}`),
};

// Chat API
export const chatAPI = {
  getChats: () =>
    api.get<{ data: Chat[]; total: number }>('/chats'),
  getChatById: (id: number) =>
    api.get<Chat>(`/chats/${id}`),
  createChat: (participants: number[]) =>
    api.post<Chat>('/chats', { participants }),
  getMessages: (chatId: number, params?: { page?: number; limit?: number }) =>
    api.get<{ data: Message[]; total: number }>(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId: number, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments) {
      attachments.forEach((file) => formData.append('attachments', file));
    }
    return api.post<Message>(`/chats/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Disease API
export const diseaseAPI = {
  getAll: (params?: PaginationParams) => api.get('/diseases', { params }),
  getById: (id: number) => api.get(`/diseases/${id}`),
  create: (data: Partial<Disease>) => api.post('/diseases', data),
  update: (id: number, data: Partial<Disease>) => api.put(`/diseases/${id}`, data),
  delete: (id: number) => api.delete(`/diseases/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params?: PaginationParams) => api.get('/inventory', { params }),
  getById: (id: number) => api.get(`/inventory/${id}`),
  create: (data: Partial<InventoryItem>) => api.post('/inventory', data),
  update: (id: number, data: Partial<InventoryItem>) => api.put(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

// Vaccination API
export const vaccinationAPI = {
  getAll: (params?: PaginationParams) => api.get('/vaccinations', { params }),
  getById: (id: number) => api.get(`/vaccinations/${id}`),
  create: (data: Partial<Vaccination>) => api.post('/vaccinations', data),
  update: (id: number, data: Partial<Vaccination>) => api.put(`/vaccinations/${id}`, data),
  delete: (id: number) => api.delete(`/vaccinations/${id}`),
};

export default api;
