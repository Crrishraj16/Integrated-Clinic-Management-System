import { AppointmentType, AppointmentStatus } from '../types';

export interface Config {
  api: {
    url: string;
    timeout: number;
    retryAttempts: number;
    version: string;
  };
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  appointmentTypes: ReadonlyArray<{
    value: AppointmentType;
    label: string;
    color: string;
  }>;
  appointmentStatus: ReadonlyArray<{
    value: AppointmentStatus;
    label: string;
    color: string;
  }>;
  security: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
  };
  menuItems: {
    value: string;
    label: string;
    icon: string;
  }[];
}

const validateEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const config: Config = {
  api: {
    url: validateEnvVar('VITE_API_URL', 'http://localhost:3001/api'),
    timeout: 30000,
    retryAttempts: 3,
    version: 'v1'
  },
  workingHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'UTC'
  },
  appointmentTypes: [
    { value: 'regular', label: 'Regular', color: '#4CAF50' },
    { value: 'follow-up', label: 'Follow-up', color: '#2196F3' },
    { value: 'emergency', label: 'Emergency', color: '#F44336' }
  ],
  appointmentStatus: [
    { value: 'scheduled', label: 'Scheduled', color: '#FFC107' },
    { value: 'completed', label: 'Completed', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancelled', color: '#F44336' }
  ],
  security: {
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    tokenExpiry: 3600
  },
  menuItems: [
    { value: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { value: 'appointments', label: 'Appointments', icon: 'calendar' },
    { value: 'patients', label: 'Patients', icon: 'people' },
    { value: 'doctors', label: 'Doctors', icon: 'medical_services' },
    { value: 'billing', label: 'Billing', icon: 'payments' },
    { value: 'settings', label: 'Settings', icon: 'settings' }
  ]
};

export default config;
