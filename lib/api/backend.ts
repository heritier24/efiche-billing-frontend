/**
 * Complete Backend API Integration for eFiche Billing System
 * Matches all documented API endpoints with proper error handling
 */

import {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  RecentInvoice,
  ActivePatients,
  RevenueSummary,
  MonthlyRevenue,
  MonthlyRevenueResponse,
  BackendPatient,
  BackendInvoice,
  BackendLineItem,
  BackendInsurance,
  BackendPayment,
  PaymentRequest,
  PaymentResponse,
  LoginResponse,
  LoginCredentials,
  SignupCredentials,
  User,
  Patient,
  CreatePatientRequest,
  PatientVisit,
  UpcomingPayment
} from '@/lib/types';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

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
  
  // Debug: Log the full URL being requested
  console.log(`[API] Making request to: ${url}`);
  
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
    
    // Log the actual error for debugging
    console.error('API Request Error:', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new ApiError('Network connection failed. Please check your internet connection.', 0);
      } else if (error.message.includes('Failed to fetch')) {
        // Check if it's trying to reach the backend API
        if (url.includes('127.0.0.1:8000')) {
          throw new ApiError('Backend server is not running. Please start the Laravel backend server on port 8000.', 0);
        } else {
          throw new ApiError('Unable to connect to server. Please try again later.', 0);
        }
      } else {
        throw new ApiError(`Network error: ${error.message}`, 0);
      }
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
   * Get recent invoices for dashboard
   */
  async getRecentInvoices(params?: { limit?: number; status?: string }): Promise<PaginatedResponse<RecentInvoice>> {
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
    return apiRequest(`/dashboard/monthly-revenue?months=${months}`);
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
   * GET /api/visits
   * Get all visits
   */
  async listVisits(params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.patient_id) query.append('patient_id', params.patient_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return apiRequest<PaginatedResponse<any>>(
      `/visits${query ? `?${query}` : ''}`
    );
  },

  /**
   * GET /api/visits/{id}
   * Get visit details
   */
  async getVisit(id: number): Promise<any> {
    return apiRequest<any>(`/visits/${id}`);
  },

  /**
   * POST /api/visits
   * Create new visit
   */
  async createVisit(visitData: {
    patient_id: number;
    facility_id?: number;
    visit_type?: string;
    status?: string;
  }): Promise<any> {
    return apiRequest<any>('/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
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

// ==================== VISIT MANAGEMENT APIS ====================

export const visitApi = {
  /**
   * GET /api/visits
   * Get all visits
   */
  async listVisits(params?: {
    patient_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.patient_id) query.append('patient_id', params.patient_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return apiRequest<PaginatedResponse<any>>(
      `/visits${query ? `?${query}` : ''}`
    );
  },

  /**
   * GET /api/visits/{id}
   * Get visit details
   */
  async getVisit(id: number): Promise<any> {
    return apiRequest<any>(`/visits/${id}`);
  },

  /**
   * POST /api/visits
   * Create new visit
   */
  async createVisit(visitData: {
    patient_id: number;
    facility_id?: number;
    visit_type?: string;
    status?: string;
  }): Promise<any> {
    return apiRequest<any>('/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  },
};

// ==================== PAYMENT MANAGEMENT APIS ====================

export const paymentApi = {
  /**
   * GET /api/payments
   * List all payments with filtering
   */
  async getAllPayments(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BackendPayment>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<BackendPayment>>(
      `/payments${query ? `?${query}` : ''}`
    );
  },

  /**
   * GET /api/payments/{id}
   * Get specific payment
   */
  async getPayment(id: number): Promise<BackendPayment> {
    return apiRequest<BackendPayment>(`/payments/${id}`);
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
   * POST /api/invoices/{invoiceId}/payments
   * Process payment for invoice
   */
  async processPayment(invoiceId: number, paymentData: PaymentRequest): Promise<PaymentResponse> {
    return apiRequest<PaymentResponse>(`/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * GET /api/payments?invoice_id={invoiceId}
   * Get payments for invoice
   */
  async getPaymentsByInvoiceId(invoiceId: number): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?invoice_id=${invoiceId}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?patient_id={patientId}
   * Get payments for patient
   */
  async getPaymentsByPatientId(patientId: number): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?patient_id=${patientId}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?date_from={date}&date_to={date}
   * Get payments by date range
   */
  async getPaymentsByDateRange(dateFrom: string, dateTo: string): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?date_from=${dateFrom}&date_to=${dateTo}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?method={method}
   * Get payments by method
   */
  async getPaymentsByMethod(method: string): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?method=${method}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?status={status}
   * Get payments by status
   */
  async getPaymentsByStatus(status: string): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?status=${status}`);
    return response.data || [];
  },

  /**
   * GET /api/payments/summary
   * Get payment statistics
   */
  async getPaymentSummary(): Promise<{
    success: boolean;
    data: {
      total_payments: number;
      completed_payments: number;
      total_revenue: number;
      pending_amount: number;
      payment_methods_breakdown: {
        cash: number;
        mobile_money: number;
        insurance: number;
      };
      monthly_stats?: {
        current_month: {
          payments: number;
          revenue: number;
        };
        previous_month: {
          payments: number;
          revenue: number;
        };
      };
    };
  }> {
    return apiRequest('/payments/summary');
  },

  /**
   * PUT /api/payments/{paymentId}/status
   * Update payment status
   */
  async updatePaymentStatus(paymentId: number, status: 'pending' | 'confirmed' | 'failed'): Promise<{
    success: boolean;
    message: string;
    data?: BackendPayment;
  }> {
    return apiRequest(`/payments/${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * DELETE /api/payments/{paymentId}
   * Delete payment
   */
  async deletePayment(paymentId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiRequest(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/payments/{paymentId}/retry
   * Retry failed payment
   */
  async retryPayment(paymentId: number): Promise<{
    success: boolean;
    message: string;
    data?: BackendPayment;
  }> {
    return apiRequest(`/payments/${paymentId}/retry`, {
      method: 'POST',
    });
  },

  /**
   * GET /api/payments?amount_min={min}&amount_max={max}
   * Get payments by amount range
   */
  async getPaymentsByAmountRange(min: number, max: number): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?amount_min=${min}&amount_max=${max}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?cashier_id={cashierId}
   * Get payments by cashier
   */
  async getPaymentsByCashierId(cashierId: number): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?cashier_id=${cashierId}`);
    return response.data || [];
  },

  /**
   * GET /api/payments?search={query}
   * Search payments
   */
  async searchPayments(query: string): Promise<BackendPayment[]> {
    const response = await apiRequest<PaginatedResponse<BackendPayment>>(`/payments?search=${query}`);
    return response.data || [];
  },

  /**
   * POST /api/payments/{paymentId}/refund
   * Process refund
   */
  async processRefund(paymentId: number, refundData: { amount: number; reason: string }): Promise<BackendPayment> {
    return apiRequest<BackendPayment>(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  /**
   * POST /api/payments/{paymentId}/cancel
   * Cancel payment
   */
  async cancelPayment(paymentId: number, reason: string): Promise<BackendPayment> {
    return apiRequest<BackendPayment>(`/payments/${paymentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

export const facilityApi = {
  /**
   * GET /api/facilities/{facilityId}/insurances
   * Get facility insurance providers
   */
  async getInsurances(facilityId: number = 1): Promise<{ data: BackendInsurance[] }> {
    return apiRequest<{ data: BackendInsurance[] }>(`/facilities/${facilityId}/insurances`);
  },
};

// ==================== USER MANAGEMENT APIS ====================

interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
}

export const userApi = {
  /**
   * GET /api/users
   * Get list of all users
   */
  async getAll(): Promise<ApiResponse<User[]>> {
    return apiRequest<ApiResponse<User[]>>('/users');
  },

  /**
   * GET /api/users/:id
   * Get single user details
   */
  async getById(id: string | number): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(`/users/${id}`);
  },

  /**
   * POST /api/users
   * Create new user
   */
  async create(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * PUT /api/users/:id
   * Update user details
   */
  async update(id: string | number, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiRequest<ApiResponse<void>>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * PUT /api/users/:id/status
   * Toggle user active/inactive status
   */
  async toggleStatus(id: string | number): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(`/users/${id}/status`, {
      method: 'PUT',
    });
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
  patients: patientApi,
  invoices: invoiceApi,
  payments: paymentApi,
  visits: visitApi,
  facilities: facilityApi,
  users: userApi,
  dashboard: dashboardApi,
};

export { ApiError };
