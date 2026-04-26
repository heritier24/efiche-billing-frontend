/**
 * Mock API Functions
 * Replace with real API calls as needed
 */

import { Invoice, Insurance, Payment } from "@/lib/types";

const API_DELAY = 500; // Simulate network delay

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock: Fetch invoice by visitId
 */
export async function getInvoice(visitId: string): Promise<Invoice> {
  await delay(API_DELAY);

  // Mock invoice data
  return {
    id: `INV-${visitId}`,
    visitId,
    patientName: "John Doe",
    invoiceDate: new Date().toISOString().split("T")[0],
    status: "pending",
    totalAmount: 50000,
    amountPaid: 0,
    remainingBalance: 50000,
    lineItems: [
      {
        id: "item-1",
        name: "Consultation",
        description: "Doctor Consultation (30 mins)",
        quantity: 1,
        unitPrice: 20000,
        totalPrice: 20000,
      },
      {
        id: "item-2",
        name: "Lab Test",
        description: "Complete Blood Count (CBC)",
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
      {
        id: "item-3",
        name: "Medication",
        description: "Antibiotic - 7 days supply",
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
  };
}

/**
 * Mock: Fetch available insurances for facility
 */
export async function getInsurances(): Promise<Insurance[]> {
  await delay(API_DELAY);

  return [
    {
      id: "ins-1",
      name: "RSSB",
      code: "RSSB-001",
      coveragePercentage: 80,
      isActive: true,
    },
    {
      id: "ins-2",
      name: "MMI",
      code: "MMI-002",
      coveragePercentage: 75,
      isActive: true,
    },
    {
      id: "ins-3",
      name: "MediCare Rwanda",
      code: "MCR-003",
      coveragePercentage: 85,
      isActive: true,
    },
  ];
}

/**
 * Mock: Process payment
 */
export async function processPayment(
  invoiceId: string,
  amount: number,
  method: string,
  insuranceId?: string
): Promise<{ success: boolean; payment: Payment; updatedInvoice: Invoice }> {
  await delay(1000); // Simulate longer processing

  const payment: Payment = {
    id: `PAY-${Date.now()}`,
    invoiceId,
    amount,
    method: method as any,
    insuranceId,
    status: method === "mobile_money" ? "pending" : "completed",
    timestamp: new Date().toISOString(),
    confirmationCode: `CNF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };

  // Mock updated invoice
  const updatedInvoice: Invoice = {
    id: invoiceId,
    visitId: "V001",
    patientName: "John Doe",
    invoiceDate: new Date().toISOString().split("T")[0],
    status: amount >= 50000 ? "paid" : "partially_paid",
    totalAmount: 50000,
    amountPaid: amount,
    remainingBalance: Math.max(0, 50000 - amount),
    lineItems: [], // Would be populated from actual data
  };

  return {
    success: true,
    payment,
    updatedInvoice,
  };
}

/**
 * Mock: Poll for mobile money payment confirmation
 */
export async function checkMobileMoneyStatus(
  paymentId: string
): Promise<{ status: "pending" | "completed" | "failed"; confirmationCode?: string }> {
  await delay(500);

  // Simulate 70% success rate after 2-3 polling attempts
  const random = Math.random();
  if (random > 0.7) {
    return {
      status: "completed",
      confirmationCode: `CNF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
  }

  return { status: "pending" };
}
