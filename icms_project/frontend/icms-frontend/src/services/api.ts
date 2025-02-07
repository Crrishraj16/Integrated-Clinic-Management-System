import axios, { AxiosResponse } from 'axios';
import { 
  User,
  Patient, 
  Appointment, 
  Prescription, 
  Vaccination, 
  Disease, 
  InventoryItem, 
  PurchaseOrder,
  EntityStatus,
  Service,
  Invoice,
  Payment,
  InsuranceClaim,
  LabOrder,
  LabTest,
  LabResult,
  Medication,
  Chat,
  Message,
  AppointmentStatus,
  RegisterData,
  LoginData
} from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  withCredentials: true,
});

// Add request interceptor to handle authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<{ user: User, token: string }>> => 
    api.post('/auth/login', { email, password }),
  register: (data: RegisterData): Promise<AxiosResponse<User>> => 
    api.post('/auth/register', data),
  refreshToken: (): Promise<AxiosResponse<{ token: string }>> => 
    api.post('/auth/refresh-token'),
  forgotPassword: (email: string): Promise<AxiosResponse<{ message: string }>> => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string): Promise<AxiosResponse<{ message: string }>> => 
    api.post('/auth/reset-password', { token, password }),
  logout: (): Promise<AxiosResponse<{ message: string }>> => 
    api.post('/auth/logout')
};

// Chat API
export const chatAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Chat>>> => 
    api.get('/chats', { params }),
  getById: (id: number): Promise<AxiosResponse<Chat>> => 
    api.get(`/chats/${id}`),
  create: (data: Partial<Chat>): Promise<AxiosResponse<Chat>> => 
    api.post('/chats', data),
  update: (id: number, data: Partial<Chat>): Promise<AxiosResponse<Chat>> => 
    api.put(`/chats/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/chats/${id}`),
  getMessages: (chatId: number, params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Message>>> => 
    api.get(`/chats/${chatId}/messages`, { params })
};

// Patient API
export const patientAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Patient>>> => 
    api.get('/patients', { params }),
  getById: (id: number): Promise<AxiosResponse<Patient>> => 
    api.get(`/patients/${id}`),
  create: (data: Partial<Patient>): Promise<AxiosResponse<Patient>> => 
    api.post('/patients', data),
  update: (id: number, data: Partial<Patient>): Promise<AxiosResponse<Patient>> => 
    api.put(`/patients/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/patients/${id}`)
};

// Appointment API
export const appointmentAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Appointment>>> => 
    api.get('/appointments', { params }),
  getById: (id: number): Promise<AxiosResponse<Appointment>> => 
    api.get(`/appointments/${id}`),
  create: (data: Partial<Appointment>): Promise<AxiosResponse<Appointment>> => 
    api.post('/appointments', data),
  update: (id: number, data: Partial<Appointment>): Promise<AxiosResponse<Appointment>> => 
    api.put(`/appointments/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/appointments/${id}`)
};

// Vaccination API
export const vaccinationAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Vaccination>>> => 
    api.get('/vaccinations', { params }),
  getById: (id: number): Promise<AxiosResponse<Vaccination>> => 
    api.get(`/vaccinations/${id}`),
  create: (data: Partial<Vaccination>): Promise<AxiosResponse<Vaccination>> => 
    api.post('/vaccinations', data),
  update: (id: number, data: Partial<Vaccination>): Promise<AxiosResponse<Vaccination>> => 
    api.put(`/vaccinations/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/vaccinations/${id}`)
};

// User API
interface UserParams extends PaginationParams {
  role?: string;
}

export const userAPI = {
  getAll: (params?: UserParams): Promise<AxiosResponse<PaginatedResponse<User>>> => 
    api.get('/users', { params }),
  getById: (id: number): Promise<AxiosResponse<User>> => 
    api.get(`/users/${id}`),
  create: (data: Partial<User>): Promise<AxiosResponse<User>> => 
    api.post('/users', data),
  update: (id: number, data: Partial<User>): Promise<AxiosResponse<User>> => 
    api.put(`/users/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/users/${id}`)
};

// Service API
export const serviceAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Service>>> => 
    api.get('/services', { params }),
  getById: (id: number): Promise<AxiosResponse<Service>> => 
    api.get(`/services/${id}`),
  create: (data: Partial<Service>): Promise<AxiosResponse<Service>> => 
    api.post('/services', data),
  update: (id: number, data: Partial<Service>): Promise<AxiosResponse<Service>> => 
    api.put(`/services/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/services/${id}`)
};

// Invoice API
export const billingAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Invoice>>> => 
    api.get('/invoices', { params }),
  getById: (id: number): Promise<AxiosResponse<Invoice>> => 
    api.get(`/invoices/${id}`),
  create: (data: Partial<Invoice>): Promise<AxiosResponse<Invoice>> => 
    api.post('/invoices', data),
  update: (id: number, data: Partial<Invoice>): Promise<AxiosResponse<Invoice>> => 
    api.put(`/invoices/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/invoices/${id}`),
  processPayment: (id: number, paymentData: { amount: number; method: string }): Promise<AxiosResponse<Payment>> => 
    api.post(`/invoices/${id}/payments`, paymentData)
};

// Payment API
export const paymentAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Payment>>> => 
    api.get('/payments', { params }),
  getById: (id: number): Promise<AxiosResponse<Payment>> => 
    api.get(`/payments/${id}`),
  create: (data: Partial<Payment>): Promise<AxiosResponse<Payment>> => 
    api.post('/payments', data),
  update: (id: number, data: Partial<Payment>): Promise<AxiosResponse<Payment>> => 
    api.put(`/payments/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/payments/${id}`)
};

// Insurance Claim API
export const claimsAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<InsuranceClaim>>> => 
    api.get('/insurance-claims', { params }),
  getById: (id: number): Promise<AxiosResponse<InsuranceClaim>> => 
    api.get(`/insurance-claims/${id}`),
  create: (data: Partial<InsuranceClaim>): Promise<AxiosResponse<InsuranceClaim>> => 
    api.post('/insurance-claims', data),
  update: (id: number, data: Partial<InsuranceClaim>): Promise<AxiosResponse<InsuranceClaim>> => 
    api.put(`/insurance-claims/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/insurance-claims/${id}`),
  submit: (id: number): Promise<AxiosResponse<InsuranceClaim>> => 
    api.post(`/insurance-claims/${id}/submit`)
};

// Lab API
export const labAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<LabOrder>>> => 
    api.get('/lab-orders', { params }),
  getById: (id: number): Promise<AxiosResponse<LabOrder>> => 
    api.get(`/lab-orders/${id}`),
  create: (data: Partial<LabOrder>): Promise<AxiosResponse<LabOrder>> => 
    api.post('/lab-orders', data),
  update: (id: number, data: Partial<LabOrder>): Promise<AxiosResponse<LabOrder>> => 
    api.put(`/lab-orders/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/lab-orders/${id}`),
  getTests: (): Promise<AxiosResponse<{ data: LabTest[]; total: number }>> => 
    api.get('/lab/tests'),
  getTestById: (id: number): Promise<AxiosResponse<LabTest>> => 
    api.get(`/lab/tests/${id}`),
  addResult: (orderId: number, resultData: LabResult): Promise<AxiosResponse<LabResult>> => 
    api.post(`/lab-orders/${orderId}/results`, resultData)
};

// Prescription API
export const prescriptionAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Prescription>>> => 
    api.get('/prescriptions', { params }),
  getById: (id: number): Promise<AxiosResponse<Prescription>> => 
    api.get(`/prescriptions/${id}`),
  create: (data: Partial<Prescription>): Promise<AxiosResponse<Prescription>> => 
    api.post('/prescriptions', data),
  update: (id: number, data: Partial<Prescription>): Promise<AxiosResponse<Prescription>> => 
    api.put(`/prescriptions/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/prescriptions/${id}`),
  getMedications: (): Promise<AxiosResponse<{ data: Medication[]; total: number }>> => 
    api.get('/medications'),
  getMedicationById: (id: number): Promise<AxiosResponse<Medication>> => 
    api.get(`/medications/${id}`)
};

// Disease API
export const diseaseAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Disease>>> => 
    api.get('/diseases', { params }),
  getById: (id: number): Promise<AxiosResponse<Disease>> => 
    api.get(`/diseases/${id}`),
  create: (data: Partial<Disease>): Promise<AxiosResponse<Disease>> => 
    api.post('/diseases', data),
  update: (id: number, data: Partial<Disease>): Promise<AxiosResponse<Disease>> => 
    api.put(`/diseases/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/diseases/${id}`)
};

// Inventory API
export const inventoryAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<InventoryItem>>> => 
    api.get('/inventory', { params }),
  getById: (id: number): Promise<AxiosResponse<InventoryItem>> => 
    api.get(`/inventory/${id}`),
  create: (data: Partial<InventoryItem>): Promise<AxiosResponse<InventoryItem>> => 
    api.post('/inventory', data),
  update: (id: number, data: Partial<InventoryItem>): Promise<AxiosResponse<InventoryItem>> => 
    api.put(`/inventory/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/inventory/${id}`)
};

// Purchase Order API
export const purchaseOrderAPI = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<PurchaseOrder>>> => 
    api.get('/purchase-orders', { params }),
  getById: (id: number): Promise<AxiosResponse<PurchaseOrder>> => 
    api.get(`/purchase-orders/${id}`),
  create: (data: Partial<PurchaseOrder>): Promise<AxiosResponse<PurchaseOrder>> => 
    api.post('/purchase-orders', data),
  update: (id: number, data: Partial<PurchaseOrder>): Promise<AxiosResponse<PurchaseOrder>> => 
    api.put(`/purchase-orders/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/purchase-orders/${id}`)
};

// Export all types for convenience
export {
  User, 
  Patient, 
  Appointment, 
  Prescription, 
  Vaccination, 
  Disease, 
  InventoryItem, 
  PurchaseOrder,
  EntityStatus,
  Service,
  Invoice,
  Payment,
  InsuranceClaim,
  LabOrder,
  LabTest,
  LabResult,
  Medication,
  Chat,
  Message,
  AppointmentStatus,
  RegisterData,
  LoginData
};

export default api;
