"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/backend";
import { BackendInvoice, BackendInsurance, BackendPayment } from "@/lib/types";
import BillingNavigation from "@/components/billing/BillingNavigation";

interface VisitBillingState {
  invoice: BackendInvoice | null;
  insurances: BackendInsurance[];
  isLoading: boolean;
  isProcessingPayment: boolean;
  isWaitingForConfirmation: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  currentPaymentId: number | null;
  selectedInsurance: BackendInsurance | null;
  paymentAmount: string;
  paymentMethod: "cash" | "mobile_money" | "insurance";
  phoneNumber: string;
}

export default function VisitBillingPage() {
  const params = useParams();
  const router = useRouter();
  const visitId = params.visitId as string;

  const [state, setState] = useState<VisitBillingState>({
    invoice: null,
    insurances: [],
    isLoading: true,
    isProcessingPayment: false,
    isWaitingForConfirmation: false,
    errorMessage: null,
    successMessage: null,
    currentPaymentId: null,
    selectedInsurance: null,
    paymentAmount: "",
    paymentMethod: "cash",
    phoneNumber: "",
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 10; // Max 50 seconds of polling (5s * 10)

  /**
   * Initial data fetch
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

        const [invoiceData, insurancesData] = await Promise.all([
          api.invoices.getInvoiceByVisit(visitId),
          api.facilities.getInsurances(1), // Default facility ID - should be dynamic
        ]);

        setState((prev) => ({
          ...prev,
          invoice: invoiceData,
          insurances: insurancesData.data || [],
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errorMessage: "Failed to load billing information. Please try again.",
        }));
        console.error("Failed to fetch billing data:", error);
      }
    };

    fetchInitialData();
  }, [visitId]);

  /**
   * Mobile Money Polling
   */
  useEffect(() => {
    if (!state.isWaitingForConfirmation || !state.currentPaymentId) {
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        pollingCountRef.current += 1;

        const paymentId = state.currentPaymentId;
        if (!paymentId) return;

        const result = await api.payments.getPaymentStatus(paymentId);

        if (result.status === "confirmed") {
          // Payment confirmed
          clearPollingInterval();
          setState((prev) => ({
            ...prev,
            isWaitingForConfirmation: false,
            successMessage: `Payment confirmed! Transaction ref: ${result.transaction_ref}`,
          }));

          // Refresh invoice data
          const updatedInvoice = await api.invoices.getInvoiceByVisit(visitId);
          setState((prev) => ({
            ...prev,
            invoice: updatedInvoice,
          }));

          // Clear success message after 5 seconds
          setTimeout(() => {
            setState((prev) => ({ ...prev, successMessage: null }));
          }, 5000);
        } else if (pollingCountRef.current >= MAX_POLLING_ATTEMPTS) {
          // Max attempts reached
          clearPollingInterval();
          setState((prev) => ({
            ...prev,
            isWaitingForConfirmation: false,
            errorMessage:
              "Payment confirmation timeout. Please verify with your provider.",
          }));
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        clearPollingInterval();
        setState((prev) => ({
          ...prev,
          isWaitingForConfirmation: false,
          errorMessage: "Failed to confirm payment. Please try again.",
        }));
      }
    };

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(pollPaymentStatus, 5000);

    // Also check immediately
    pollPaymentStatus();

    return () => {
      clearPollingInterval();
    };
  }, [state.isWaitingForConfirmation, state.currentPaymentId, visitId]);

  /**
   * Clear polling interval
   */
  const clearPollingInterval = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingCountRef.current = 0;
  };

  /**
   * Handle payment form submission
   */
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.invoice || !state.paymentAmount) {
      setState((prev) => ({
        ...prev,
        errorMessage: "Please enter a payment amount.",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isProcessingPayment: true,
        errorMessage: null,
        successMessage: null,
      }));

      const paymentData = {
        amount: state.paymentAmount,
        method: state.paymentMethod,
        phone_number: state.phoneNumber,
        insurance_id: state.selectedInsurance?.id,
        notes: `Payment for visit ${visitId}`,
      };

      const payment = await api.payments.processPayment(state.invoice.id, paymentData);

      // Payment was successful
      if (payment) {
        if (paymentData.method === "mobile_money") {
          // Start polling for confirmation
          setState((prev) => ({
            ...prev,
            isProcessingPayment: false,
            isWaitingForConfirmation: true,
            currentPaymentId: payment.data?.id,
            successMessage: "Payment initiated. Waiting for provider confirmation...",
          }));
        } else {
          // Immediate confirmation
          setState((prev) => ({
            ...prev,
            isProcessingPayment: false,
            successMessage: `Payment of RWF ${parseFloat(paymentData.amount).toLocaleString()} processed successfully!`,
          }));

          // Refresh invoice
          const updatedInvoice = await api.invoices.getInvoiceByVisit(visitId);
          setState((prev) => ({
            ...prev,
            invoice: updatedInvoice,
          }));

          // Clear success message after 5 seconds
          setTimeout(() => {
            setState((prev) => ({ ...prev, successMessage: null }));
          }, 5000);
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProcessingPayment: false,
        isWaitingForConfirmation: false,
        errorMessage: "Payment processing failed. Please try again.",
      }));
      console.error("Payment error:", error);
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  /**
   * Calculate remaining balance
   */
  const getRemainingBalance = () => {
    if (!state.invoice) return 0;
    return state.invoice.total_amount - (state.invoice.total_paid || 0);
  };

  // Loading state
  if (state.isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <h1 className="text-2xl font-bold text-neutral-900">Patient Billing</h1>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-neutral-600 mt-4">Loading billing information...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (!state.invoice) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <h1 className="text-2xl font-bold text-neutral-900">Patient Billing</h1>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Invoice Not Found</h3>
              <p className="text-neutral-600 mb-6">Unable to load invoice for this visit.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Main render
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <BillingNavigation visitId={visitId} />

      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Patient Billing</h1>
              <p className="text-sm text-neutral-600 mt-1">Healthcare Invoice & Payment</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Visit ID</p>
              <p className="text-xl font-semibold text-neutral-900">{visitId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">Patient Invoice</h2>
          <p className="text-neutral-600 mt-2">
            Manage and process payment for this patient visit
          </p>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Invoice Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Invoice ID:</span>
              <span className="font-medium">{state.invoice.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total Amount:</span>
              <span className="font-medium">{formatCurrency(state.invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Amount Paid:</span>
              <span className="font-medium">{formatCurrency(state.invoice.total_paid || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Remaining Balance:</span>
              <span className="font-medium text-lg text-primary-600">
                {formatCurrency(getRemainingBalance())}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Line Items</h3>
          <div className="space-y-3">
            {state.invoice.line_items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="font-medium text-neutral-900">{item.description}</p>
                  <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                  <p className="text-sm text-neutral-600">{formatCurrency(item.quantity * item.unit_price)}</p>
                </div>
              </div>
            )) || (
              <p className="text-neutral-600">No line items found</p>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Process Payment</h3>
          
          {/* Success/Error Messages */}
          {state.successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{state.successMessage}</p>
            </div>
          )}
          
          {state.errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{state.errorMessage}</p>
            </div>
          )}

          {state.isWaitingForConfirmation && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <p className="text-blue-800">
                  Waiting for mobile money confirmation... This may take a few minutes.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Payment Amount (RWF) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={state.paymentAmount}
                  onChange={(e) => setState(prev => ({ ...prev, paymentAmount: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  max={getRemainingBalance()}
                  required
                />
                <p className="text-sm text-neutral-600 mt-1">
                  Maximum: {formatCurrency(getRemainingBalance())}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={state.paymentMethod}
                  onChange={(e) => setState(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
            </div>

            {state.paymentMethod === "mobile_money" && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={state.phoneNumber}
                  onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+250788123456"
                  pattern="\+2507\d{8}"
                  required
                />
                <p className="text-sm text-neutral-600 mt-1">
                  Format: +2507xxxxxxxx (Rwanda numbers only)
                </p>
              </div>
            )}

            {state.paymentMethod === "insurance" && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Insurance Provider *
                </label>
                <select
                  value={state.selectedInsurance?.id || ""}
                  onChange={(e) => {
                    const insurance = state.insurances.find(i => i.id === parseInt(e.target.value));
                    setState(prev => ({ ...prev, selectedInsurance: insurance || null }));
                  }}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Insurance</option>
                  {state.insurances.map((insurance) => (
                    <option key={insurance.id} value={insurance.id}>
                      {insurance.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/invoices")}
                className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Back to Invoices
              </button>
              <button
                type="submit"
                disabled={state.isProcessingPayment || state.isWaitingForConfirmation}
                className="px-4 py-2 bg-primary-600 text-white border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isProcessingPayment ? 'Processing...' : 
                 state.isWaitingForConfirmation ? 'Waiting for Confirmation...' : 
                 `Pay ${state.paymentAmount ? formatCurrency(parseFloat(state.paymentAmount)) : '0.00'}`}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mt-8">
          <p className="text-xs text-neutral-600">
            <span className="font-semibold">📞 Support:</span> For billing inquiries, contact support at{" "}
            <a
              href="mailto:billing@efiche.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              billing@efiche.com
            </a>{" "}
            or call +250-800-123-456
          </p>
        </div>
      </div>
    </main>
  );
}
