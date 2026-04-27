/**
 * Billing Domain Types - Backend API Integration
 */

export type InvoiceStatus = "pending" | "paid" | "partially_paid";
export type PaymentMethod = "cash" | "mobile_money" | "insurance";
export type PaymentStatus = "pending" | "confirmed" | "failed";
export type PatientStatus = "active" | "inactive";
export type Gender = "male" | "female";

// Authentication Types (re-export from auth/types for convenience)
export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "cashier" | "staff";
  avatar?: string | null;
  created_at?: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  expires_in: number;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "admin" | "cashier" | "staff";
}

// Backend API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// Dashboard Types
export interface DashboardStats {
  total_invoices: number;
  total_revenue: number;
  pending_invoices: number;
  active_patients: number;
  monthly_stats: {
    current_month: {
      invoices: number;
      revenue: number;
      patients: number;
    };
    previous_month: {
      invoices: number;
      revenue: number;
      patients: number;
    };
  };
  payment_methods_breakdown: {
    cash: number;
    mobile_money: number;
    insurance: number;
  };
}

export interface RecentInvoice {
  id: number;
  invoice_number: string;
  patient_name: string;
  total_amount: number;
  status: InvoiceStatus;
  created_at: string;
  due_date: string;
}

export interface ActivePatients {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  last_visit: string;
}

export interface RevenueSummary {
  total_revenue: number;
  growth_rate: number;
  breakdown: {
    cash: number;
    mobile_money: number;
    insurance: number;
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  growth: number;
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenue[];
  total_revenue: number;
  growth_rate: number;
}

export interface UpcomingPayment {
  id: number;
  invoice_number: string;
  patient_name: string;
  amount_due: number;
  due_date: string;
  days_overdue?: number;
  patient_phone: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  invoices_count: number;
  growth_rate: number;
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenue[];
  current_month: MonthlyRevenue;
  year_total: number;
}

// Patient Types
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  insurance_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BackendPatient {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_id?: number;
}

export interface PatientVisit {
  id: number;
  patient_id: number;
  visit_type: string;
  status: string;
  invoice_id?: number;
  invoice_number?: string;
  total_amount?: number;
  paid_amount?: number;
}

// Visit Management Types
export interface Visit {
  id: number;
  patient_id: number;
  facility_id: number;
  visit_type: 'consultation' | 'follow_up' | 'emergency' | 'general';
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  };
  invoices?: Array<{
    id: number;
    invoice_number: string;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
}

// Invoice Types
export interface BackendLineItem {
  id: number;
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface BackendInvoice {
  id: number;
  invoice_number: string;
  visit_id: number;
  status: InvoiceStatus;
  total_amount: number;
  insurance_coverage: number;
  patient_responsibility: number;
  total_paid: number;
  remaining_balance: number;
  due_date: string;
  created_at: string;
  line_items: BackendLineItem[];
  payments: Payment[];
  visit: {
    id: number;
    patient: {
      id: number;
      full_name: string;
      phone: string;
    };
    facility: {
      id: number;
      name: string;
    };
  };
}

// Payment Types
export interface BackendPayment {
  id: number;
  invoice_id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cashier_id?: number;
}

// Payment Response Type (for backend API responses)
export interface PaymentResponse {
  success: boolean;
  message: string;
  data: BackendPayment;
  invoice_status?: string;
  remaining_balance?: number;
}

export interface PaymentRequest {
  amount: string;
  method: PaymentMethod;
  phone?: string; // For mobile_money
  notes?: string;
}

// Insurance Types
export interface BackendInsurance {
  id: number;
  name: string;
  code: string;
  coverage_percentage: number;
  max_claim_amount: number;
  requires_preauth: boolean;
  is_active: boolean;
}

// Frontend Types (compatibility layer)
export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  visitId: string;
  patientName: string;
  invoiceDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  lineItems: LineItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  insuranceId?: string;
  status: PaymentStatus;
  timestamp: string;
  confirmationCode?: string;
}

export interface Insurance {
  id: string;
  name: string;
  code: string;
  coveragePercentage: number;
  isActive: boolean;
}

export interface PaymentFormData {
  amount: number;
  method: PaymentMethod;
  insuranceId?: string;
  phoneNumber?: string;
  notes?: string;
}
