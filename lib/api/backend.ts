/**
 * Complete Backend API Integration for eFiche Billing System
 * Matches all documented API endpoints with proper error handling
 */

import {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  RecentInvoice,
  UpcomingPayment,
  MonthlyRevenueResponse,
  Patient,
  PatientVisit,
  CreatePatientRequest,
  BackendInvoice,
  BackendPayment,
  PaymentRequest,
  BackendInsurance,
  LoginResponse,
  LoginCredentials,
  SignupCredentials,
  User
} from '@/lib/types';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// API Error Handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  // Get auth token
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') 
    : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0);
  }
}

// ==================== AUTHENTICATION APIS ====================

export const authApi = {
  /**
   * POST /api/auth/login
   * User authentication with JWT tokens
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * POST /api/auth/logout
   * Logout and invalidate current token
   */
  async logout(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * POST /api/auth/register
   * Register new user (admin only)
   */
  async register(userData: SignupCredentials): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * GET /api/auth/me
   * Get current authenticated user details
   */
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },
};

// ==================== DASHBOARD APIS ====================

export const dashboardApi = {
  /**
   * GET /api/dashboard/stats
   * Dashboard statistics overview
   */
  async getStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/dashboard/stats');
  },

  /**
   * GET /api/dashboard/recent-invoices
   * Recent invoices for dashboard display
   */
  async getRecentInvoices(params?: {
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<RecentInvoice>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<RecentInvoice>>(
      `/dashboard/recent-invoices${query ? `?${query}` : ''}`
    );
  },

  /**
   * GET /api/dashboard/upcoming-payments
   * Upcoming payment reminders
   */
  async getUpcomingPayments(): Promise<{
    data: UpcomingPayment[];
    total_overdue: number;
    total_due_this_week: number;
  }> {
    return apiRequest('/dashboard/upcoming-payments');
  },

  /**
   * GET /api/dashboard/monthly-revenue
   * Monthly revenue trends
   */
  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenueResponse> {
    return apiRequest<MonthlyRevenueResponse>(
      `/dashboard/monthly-revenue?months=${months}`
    );
  },
};

// ==================== PATIENT MANAGEMENT APIS ====================

export const patientApi = {
  /**
   * GET /api/patients
   * List patients with search and filters
   */
  async listPatients(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Patient>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<Patient>>(
      `/patients${query ? `?${query}` : ''}`
    );
  },

  /**
   * POST /api/patients
   * Create new patient
   */
  async createPatient(patientData: CreatePatientRequest): Promise<ApiResponse<Patient>> {
    return apiRequest<ApiResponse<Patient>>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * GET /api/patients/{id}
   * Get patient details
   */
  async getPatient(id: number): Promise<Patient & { visits: PatientVisit[] }> {
    return apiRequest<Patient & { visits: PatientVisit[] }>(`/patients/${id}`);
  },

  /**
   * PUT /api/patients/{id}
   * Update patient information
   */
  async updatePatient(
    id: number,
    patientData: Partial<CreatePatientRequest>
  ): Promise<ApiResponse<Patient>> {
    return apiRequest<ApiResponse<Patient>>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * GET /api/patients/{id}/visits
   * Patient visit history
   */
  async getPatientVisits(id: number): Promise<{
    data: PatientVisit[];
    total: number;
    last_visit: string;
  }> {
    return apiRequest(`/patients/${id}/visits`);
  },
};

// ==================== INVOICE MANAGEMENT APIS ====================

export const invoiceApi = {
  /**
   * GET /api/invoices
   * List invoices with advanced filtering
   */
  async listInvoices(params?: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BackendInvoice>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<BackendInvoice>>(
      `/invoices${query ? `?${query}` : ''}`
    );
  },

  /**
   * POST /api/invoices
   * Create new invoice
   */
  async createInvoice(invoiceData: {
    visit_id: number;
    line_items: Array<{
      item_code: string;
      description: string;
      quantity: number;
      unit_price: number;
    }>;
    insurance_id?: number;
    due_date: string;
  }): Promise<BackendInvoice> {
    return apiRequest<BackendInvoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  /**
   * GET /api/invoices/{id}
   * Get invoice details
   */
  async getInvoice(id: number): Promise<BackendInvoice> {
    return apiRequest<BackendInvoice>(`/invoices/${id}`);
  },

  /**
   * GET /api/visits/{visitId}/invoice
   * Get invoice by visit ID
   */
  async getInvoiceByVisit(visitId: string): Promise<BackendInvoice> {
    return apiRequest<BackendInvoice>(`/visits/${visitId}/invoice`);
  },
};

// ==================== PAYMENT MANAGEMENT APIS ====================

export const paymentApi = {
  /**
   * POST /api/invoices/{invoiceId}/payments
   * Process payment for invoice
   */
  async processPayment(
    invoiceId: number,
    paymentData: PaymentRequest
  ): Promise<BackendPayment> {
    return apiRequest<BackendPayment>(`/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * GET /api/payments
   * List payments with filtering
   */
  async listPayments(params?: {
    search?: string;
    method?: string;
    status?: string;
    date_from?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BackendPayment>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.method) searchParams.append('method', params.method);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<BackendPayment>>(
      `/payments${query ? `?${query}` : ''}`
    );
  },

  /**
   * GET /api/payments/{paymentId}/status
   * Get payment status
   */
  async getPaymentStatus(paymentId: number): Promise<{
    id: number;
    status: string;
    confirmed_at?: string;
    transaction_ref: string;
  }> {
    return apiRequest(`/payments/${paymentId}/status`);
  },

  /**
   * GET /api/payments/{id}
   * Get payment details
   */
  async getPayment(id: number): Promise<BackendPayment> {
    return apiRequest<BackendPayment>(`/payments/${id}`);
  },
};

// ==================== FACILITY & INSURANCE APIS ====================

export const facilityApi = {
  /**
   * GET /api/facilities/{facilityId}/insurances
   * Get facility insurance providers
   */
  async getInsurances(facilityId: number = 1): Promise<{ data: BackendInsurance[] }> {
    return apiRequest<{ data: BackendInsurance[] }>(`/facilities/${facilityId}/insurances`);
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency for display (RWF)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format phone number to Rwanda format
 */
export function formatPhoneNumber(phone: string): string {
  // Ensure +250 prefix and proper formatting
  if (!phone.startsWith('+250')) {
    return `+250${phone.replace(/^0/, '')}`;
  }
  return phone;
}

/**
 * Validate Rwanda phone number
 */
export function validateRwandaPhone(phone: string): boolean {
  const rwandaPhoneRegex = /^\+2507\d{8}$/;
  return rwandaPhoneRegex.test(phone);
}

/**
 * Format date for API requests
 */
export function formatDateForApi(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

// Export all APIs for easy import
export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  patients: patientApi,
  invoices: invoiceApi,
  payments: paymentApi,
  facilities: facilityApi,
};

export { ApiError };
