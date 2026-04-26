"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import InvoiceSummary from "@/components/billing/InvoiceSummary";
import LineItemsList from "@/components/billing/LineItemsList";
import PaymentForm from "@/components/billing/PaymentForm";
import {
  Invoice,
  Insurance,
  PaymentFormData,
  Payment,
} from "@/lib/types";
import {
  getInvoice,
  getInsurances,
  processPayment,
  checkMobileMoneyStatus,
} from "@/lib/api/mock";

interface BillingPageState {
  invoice: Invoice | null;
  insurances: Insurance[];
  isLoading: boolean;
  isProcessingPayment: boolean;
  isWaitingForConfirmation: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  currentPaymentId: string | null;
}

export default function BillingPage() {
  const params = useParams();
  const visitId = params.visitId as string;

  const [state, setState] = useState<BillingPageState>({
    invoice: null,
    insurances: [],
    isLoading: true,
    isProcessingPayment: false,
    isWaitingForConfirmation: false,
    errorMessage: null,
    successMessage: null,
    currentPaymentId: null,
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
          getInvoice(visitId),
          getInsurances(),
        ]);

        setState((prev) => ({
          ...prev,
          invoice: invoiceData,
          insurances: insurancesData,
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

        const result = await checkMobileMoneyStatus(paymentId);

        if (result.status === "completed") {
          // Payment confirmed
          clearPollingInterval();
          setState((prev) => ({
            ...prev,
            isWaitingForConfirmation: false,
            successMessage: `Payment confirmed! Confirmation code: ${result.confirmationCode}`,
          }));

          // Refresh invoice data
          const updatedInvoice = await getInvoice(visitId);
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
  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    if (!state.invoice) return;

    try {
      setState((prev) => ({
        ...prev,
        isProcessingPayment: true,
        errorMessage: null,
        successMessage: null,
      }));

      const { success, payment } = await processPayment(
        state.invoice.id,
        formData.amount,
        formData.method,
        formData.insuranceId
      );

      if (success) {
        if (formData.method === "mobile_money") {
          // Start polling for confirmation
          setState((prev) => ({
            ...prev,
            isProcessingPayment: false,
            isWaitingForConfirmation: true,
            currentPaymentId: payment.id,
            successMessage: "Payment initiated. Waiting for provider confirmation...",
          }));
        } else {
          // Immediate confirmation
          setState((prev) => ({
            ...prev,
            isProcessingPayment: false,
            successMessage: `Payment of KES ${formData.amount.toFixed(2)} processed successfully!`,
          }));

          // Refresh invoice
          const updatedInvoice = await getInvoice(visitId);
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

  // Loading state
  if (state.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-700 text-lg">
                Loading billing information...
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (!state.invoice) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ✗ Unable to load invoice information
              </p>
              <p className="text-red-700 text-sm mt-2">
                {state.errorMessage ||
                  "The invoice could not be found. Please check the visit ID and try again."}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Main render
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Billing</h1>
          <p className="text-gray-600 mt-2">Visit ID: {visitId}</p>
        </div>

        {/* Invoice Summary */}
        <InvoiceSummary invoice={state.invoice} />

        {/* Line Items */}
        <LineItemsList items={state.invoice.lineItems} />

        {/* Payment Form */}
        <PaymentForm
          invoice={state.invoice}
          insurances={state.insurances}
          onSubmit={handlePaymentSubmit}
          isLoading={state.isProcessingPayment}
          isWaitingForConfirmation={state.isWaitingForConfirmation}
          successMessage={state.successMessage || undefined}
          errorMessage={state.errorMessage || undefined}
        />

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <p className="text-xs text-gray-500">
            For inquiries, contact billing support at billing@hospital.com or
            call +254-800-123-456
          </p>
        </div>
      </div>
    </main>
  );
}
