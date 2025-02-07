// Time constants
export const DEBOUNCE_DELAY = 300;
export const AUTO_DISMISS_DURATION = 5000;
export const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 15; // 15 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// Form validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 50;
export const MAX_NOTES_LENGTH = 500;
export const PHONE_NUMBER_LENGTH = 10;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Date formats
export const DATE_FORMAT = 'PP';
export const TIME_FORMAT = 'p';
export const DATE_TIME_FORMAT = 'PPp';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  PATIENTS: {
    BASE: '/patients',
    SEARCH: '/patients/search',
    MEDICAL_HISTORY: '/patients/medical-history',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    SCHEDULE: '/appointments/schedule',
    CANCEL: '/appointments/cancel',
  },
  BILLING: {
    INVOICES: '/billing/invoices',
    PAYMENTS: '/billing/payments',
    CLAIMS: '/billing/claims',
  },
  CLINICAL: {
    LAB_ORDERS: '/clinical/lab-orders',
    PRESCRIPTIONS: '/clinical/prescriptions',
    VACCINATIONS: '/clinical/vaccinations',
  },
};

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully.',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
  PAYMENT_PROCESSED: 'Payment processed successfully.',
  CLAIM_SUBMITTED: 'Claim submitted successfully.',
};
