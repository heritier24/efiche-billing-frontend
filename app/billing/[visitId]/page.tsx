"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import InvoiceSummary from "@/components/billing/InvoiceSummary";
import LineItemsList from "@/components/billing/LineItemsList";
import PaymentForm from "@/components/billing/EnhancedPaymentForm";
import LoadingSkeleton from "@/components/billing/LoadingSkeleton";
import EmptyState from "@/components/billing/EmptyState";
import PaymentStatusIndicator from "@/components/billing/PaymentStatusIndicator";
import { Invoice, Insurance, PaymentFormData, Payment, PaymentRequest } from "@/lib/types";
import { api } from "@/lib/api/backend";
import { BackendInvoice, BackendInsurance, BackendPayment } from "@/lib/types";

interface BillingPageState {
  invoice: BackendInvoice | null;
  insurances: BackendInsurance[];
  isLoading: boolean;
  isProcessingPayment: boolean;
  isWaitingForConfirmation: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  currentPaymentId: number | null;
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
          api.invoices.getInvoiceByVisit(visitId).catch(err => {
            console.error('Failed to fetch invoice:', err);
            return null;
          }),
          api.facilities.getInsurances(1).catch(err => {
            console.error('Failed to fetch insurances:', err);
            return { data: [] };
          }),
        ]);

        setState((prev) => ({
          ...prev,
          invoice: invoiceData,
          insurances: insurancesData?.data || [],
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
            successMessage: "Payment successful! Transaction completed.",
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
        } else if (result.status === "failed") {
          // Payment failed
          clearPollingInterval();
          setState((prev) => ({
            ...prev,
            isWaitingForConfirmation: false,
            errorMessage: "Payment failed. Please try again or contact support.",
          }));
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
  const handlePaymentSubmit = async (paymentRequestData: PaymentRequest) => {
    if (!state.invoice) return;

    try {
      setState((prev) => ({
        ...prev,
        isProcessingPayment: true,
        errorMessage: null,
        successMessage: null,
      }));

      const payment = await api.payments.processPayment(state.invoice.id, paymentRequestData);

      // Payment was successful
      if (payment) {
        if (paymentRequestData.method === "mobile_money") {
          // Start polling for confirmation
          setState((prev) => ({
            ...prev,
            isWaitingForConfirmation: true,
            currentPaymentId: payment.data?.id,
            successMessage: "Waiting for mobile money confirmation...",
          }));
        } else {
          // Immediate confirmation
          setState((prev) => ({
            ...prev,
            isProcessingPayment: false,
            successMessage: `Payment of RWF ${parseFloat(paymentRequestData.amount).toLocaleString()} processed successfully!`,
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
          <LoadingSkeleton />
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
          <EmptyState 
            visitId={visitId} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </main>
    );
  }

  // Main render
  return (
    <main className="min-h-screen bg-neutral-50">
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
        <InvoiceSummary invoice={state.invoice} />

        {/* Line Items */}
        <LineItemsList items={state.invoice?.line_items || []} />

        {/* Payment Status Messages */}
        {state.isWaitingForConfirmation && (
          <PaymentStatusIndicator 
            status="pending" 
            message="Waiting for mobile money confirmation..."
          />
        )}
        
        {state.successMessage && !state.isWaitingForConfirmation && (
          <PaymentStatusIndicator 
            status="confirmed" 
            message={state.successMessage}
          />
        )}
        
        {state.errorMessage && !state.isWaitingForConfirmation && (
          <PaymentStatusIndicator 
            status="failed" 
            message={state.errorMessage}
          />
        )}

        {/* Payment Form */}
        <PaymentForm
          invoice={state.invoice}
          insurances={state.insurances || []}
          onSubmit={handlePaymentSubmit}
          isLoading={state.isProcessingPayment || state.isWaitingForConfirmation}
          isWaitingForConfirmation={state.isWaitingForConfirmation}
          successMessage={state.successMessage || undefined}
          errorMessage={state.errorMessage || undefined}
        />

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
