/**
 * Billing Domain Types
 */

export type InvoiceStatus = "pending" | "paid" | "partially_paid";
export type PaymentMethod = "cash" | "mobile_money" | "insurance";
export type PaymentStatus = "pending" | "completed" | "failed";

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
}
