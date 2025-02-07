export type AppointmentType = 'regular' | 'follow-up' | 'emergency';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Config {
  apiUrl: string;
  workingHours: {
    start: string;
    end: string;
  };
  appointmentTypes: Array<{
    value: AppointmentType;
    label: string;
  }>;
  appointmentStatus: Array<{
    value: AppointmentStatus;
    label: string;
  }>;
  menuItems: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
}

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends BaseResponse<T> {
  total: number;
  page: number;
  limit: number;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  specialization?: string;
  phone?: string;
  address?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  validFrom: string;
  validUntil: string;
  primaryHolder: string;
  relationship?: string;
}

export interface Patient extends BaseEntity {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string;
  clinicalNotes?: Array<{
    date: string;
    note: string;
    doctorId: number;
    doctor?: User;
  }>;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: InsuranceInfo;
}

export interface Appointment extends BaseEntity {
  dateTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  roomNumber: string;
  patientId: number;
  doctorId: number;
  notes?: string;
  patient?: Patient;
  doctor?: User;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export type LabTestStatus = 'pending' | 'completed' | 'cancelled';

export interface LabTest extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  duration?: number;
  requiredFasting: boolean;
  instructions?: string;
}

export interface LabOrder extends BaseEntity {
  patientId: number;
  doctorId: number;
  date: string;
  tests: Array<{
    testId: number;
    test?: LabTest;
    instructions?: string;
    status: LabTestStatus;
  }>;
  notes?: string;
  patient?: Patient;
  doctor?: User;
  status: LabTestStatus;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  cost: number;
  duration: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  serviceId: number;
  service?: Service;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  patientId: number;
  patient?: Patient;
  items: Array<InvoiceItem>;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'insurance';
  paymentStatus?: 'pending' | 'partial' | 'completed' | 'refunded';
  dueDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  /* services: Array<{
    serviceId: number;
    service?: Service;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  invoice?: Invoice;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'insurance';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceClaim {
  id: number;
  patientId: number;
  patient?: Patient;
  invoiceId: number;
  invoice?: Invoice;
  insuranceProvider: string;
  policyNumber: string;
  claimNumber?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submissionDate: string;
  approvalDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabTest {
  id: number;
  name: string;
  description: string;
  category: string;
  cost: number;
  normalRange?: string;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabOrder {
  id: number;
  patientId: number;
  patient?: Patient;
  doctorId: number;
  doctor?: User;
  tests: Array<{
    testId: number;
    test?: LabTest;
    result?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }>;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabResult {
  id: number;
  orderId: number;
  order?: LabOrder;
  testId: number;
  test?: LabTest;
  result: string;
  normalRange?: string;
  interpretation?: string;
  performedBy: number;
  performedByUser?: User;
  verifiedBy?: number;
  verifiedByUser?: User;
  status: 'pending' | 'completed' | 'verified';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  id: number;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  patient?: Patient;
  doctorId: number;
  doctor?: User;
  medications: Array<{
    medicationId: number;
    medication?: Medication;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  diagnosis?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface Chat {
  id: number;
  participants: Array<{
    userId: number;
    user?: User;
    role: 'patient' | 'doctor' | 'staff';
  }>;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  sender?: User;
  content: string;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
  readBy?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  preventions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  cost: number;
  supplier?: string;
  supplierId?: number;
  location?: string;
  expiryDate?: string;
  unitPrice?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: number;
  date: string;
  expectedDelivery: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  supplierId: number;
  supplier?: {
    id: number;
    name: string;
    contact: string;
    email: string;
  };
  items: Array<{
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vaccination {
  id: number;
  patientId: number;
  patient?: Patient;
  vaccineName: string;
  dose: string;
  date: string;
  nextDueDate?: string;
  administeredBy: number;
  administeredByUser?: User;
  batchNumber?: string;
  manufacturer?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}
