export interface User {
  id?: number;
  email: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'staff';
  phone: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends Omit<LoginCredentials, 'email'> {
  email: string;
  confirmPassword: string;
  full_name: string;
  role: User['role'];
  phone: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}
