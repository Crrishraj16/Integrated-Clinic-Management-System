import axios from 'axios';
import { Invoice, Payment, InsuranceClaim } from '../../types';

const BASE_URL = '/api/billing';

export const billingAPI = {
  // Invoice endpoints
  getInvoices: (params?: any) => axios.get(`${BASE_URL}/invoices`, { params }),
  getInvoiceById: (id: number) => axios.get(`${BASE_URL}/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) => axios.post(`${BASE_URL}/invoices`, data),
  updateInvoice: (id: number, data: Partial<Invoice>) => axios.put(`${BASE_URL}/invoices/${id}`, data),
  deleteInvoice: (id: number) => axios.delete(`${BASE_URL}/invoices/${id}`),

  // Payment endpoints
  getPayments: (params?: any) => axios.get(`${BASE_URL}/payments`, { params }),
  getPaymentById: (id: number) => axios.get(`${BASE_URL}/payments/${id}`),
  createPayment: (data: Partial<Payment>) => axios.post(`${BASE_URL}/payments`, data),
  updatePayment: (id: number, data: Partial<Payment>) => axios.put(`${BASE_URL}/payments/${id}`, data),
  deletePayment: (id: number) => axios.delete(`${BASE_URL}/payments/${id}`),
};

export const claimsAPI = {
  // Insurance claim endpoints
  getClaims: (params?: any) => axios.get(`${BASE_URL}/claims`, { params }),
  getClaimById: (id: number) => axios.get(`${BASE_URL}/claims/${id}`),
  createClaim: (data: Partial<InsuranceClaim>) => axios.post(`${BASE_URL}/claims`, data),
  updateClaim: (id: number, data: Partial<InsuranceClaim>) => axios.put(`${BASE_URL}/claims/${id}`, data),
  deleteClaim: (id: number) => axios.delete(`${BASE_URL}/claims/${id}`),
};
