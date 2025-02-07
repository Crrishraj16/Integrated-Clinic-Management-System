// Core User and Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  profilePicture?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: User['role'];
}

export interface LoginData {
  email: string;
  password: string;
}

// Enum Definitions
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export type AppointmentType = 'regular' | 'follow-up' | 'emergency';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum LabTestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Patient Related Types
export interface Patient {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  email: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string[];
  clinicalNotes?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  status: EntityStatus;
}

// Vaccination Related Types
export interface Vaccination {
  id: number;
  patientId: number;
  vaccineType: string;
  doseNumber: number;
  administeredDate: string;
  administeredBy: string;
  administrationSite?: string;
  adverseReactions?: string[];
  status: EntityStatus;
}

// Appointment Related Types
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
}

// Prescription Related Types
export interface Prescription {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  medications: {
    medicationId: number;
    dosage: string;
    frequency: string;
  }[];
  instructions?: string;
  status: EntityStatus;
}

// Medication Related Types
export interface Medication {
  id: number;
  name: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  description?: string;
  status: EntityStatus;
}

// Inventory Related Types
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  expiryDate?: string;
  status: EntityStatus;
}

// Disease Related Types
export interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string[];
  treatments: string[];
  status: EntityStatus;
}

// Chat and Messaging Types
export interface Chat {
  id: number;
  participants: number[];
  createdAt: string;
  lastMessageAt?: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

// Lab Related Types
export interface LabTest {
  id: number;
  name: string;
  description: string;
  normalRange?: string;
  unit?: string;
}

export interface LabResult {
  id: number;
  labOrderId: number;
  testId: number;
  result: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface LabTestOrder {
  id: number;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: LabTestStatus;
}

export interface LabOrder {
  id: number;
  patientId: number;
  doctorId: number;
  tests: number[];
  date: string;
  status: EntityStatus;
}

// Additional Complex Types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Invoice {
  id: number;
  patientId: number;
  services: {
    serviceId: number;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'insurance';
  date: string;
}

export interface InsuranceClaim {
  id: number;
  patientId: number;
  invoiceId: number;
  insuranceProvider: string;
  claimAmount: number;
  status: 'submitted' | 'approved' | 'rejected';
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  items: {
    inventoryItemId: number;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}
