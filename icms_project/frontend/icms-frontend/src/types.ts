export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'doctor' | 'staff' | 'admin';
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'doctor' | 'staff' | 'admin';
}

export interface Patient {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Billing {
  id?: number;
  appointmentId: number;
  patientId: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
  description?: string;
}
