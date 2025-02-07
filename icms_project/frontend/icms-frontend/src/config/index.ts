import { Config } from '../types';

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  workingHours: {
    start: '09:00',
    end: '17:00'
  },
  appointmentTypes: [
    { value: 'regular', label: 'Regular' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' }
  ],
  appointmentStatus: [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ],
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
