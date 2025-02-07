import axios, { AxiosResponse } from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, Patient, Appointment, Billing } from '../types';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', credentials),
  register: (userData: Omit<RegisterData, 'confirmPassword'>): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/register', userData),
};

export const patientAPI = {
  getAll: (): Promise<AxiosResponse<Patient[]>> =>
    api.get('/patients'),
  getById: (id: number): Promise<AxiosResponse<Patient>> =>
    api.get(`/patients/${id}`),
  create: (patientData: Patient): Promise<AxiosResponse<Patient>> =>
    api.post('/patients', patientData),
  update: (id: number, patientData: Partial<Patient>): Promise<AxiosResponse<Patient>> =>
    api.put(`/patients/${id}`, patientData),
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/patients/${id}`),
};

export const appointmentAPI = {
  getAll: (): Promise<AxiosResponse<Appointment[]>> =>
    api.get('/appointments'),
  getById: (id: number): Promise<AxiosResponse<Appointment>> =>
    api.get(`/appointments/${id}`),
  create: (appointmentData: Appointment): Promise<AxiosResponse<Appointment>> =>
    api.post('/appointments', appointmentData),
  update: (id: number, appointmentData: Partial<Appointment>): Promise<AxiosResponse<Appointment>> =>
    api.put(`/appointments/${id}`, appointmentData),
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/appointments/${id}`),
};

export const billingAPI = {
  getAll: (): Promise<AxiosResponse<Billing[]>> =>
    api.get('/billing'),
  getById: (id: number): Promise<AxiosResponse<Billing>> =>
    api.get(`/billing/${id}`),
  create: (billingData: Billing): Promise<AxiosResponse<Billing>> =>
    api.post('/billing', billingData),
  update: (id: number, billingData: Partial<Billing>): Promise<AxiosResponse<Billing>> =>
    api.put(`/billing/${id}`, billingData),
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/billing/${id}`),
};

export const userAPI = {
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/users/me'),
  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/users/me', userData),
};

export default api;
