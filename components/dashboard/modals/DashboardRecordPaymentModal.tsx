"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/backend";

interface PendingInvoice {
  id: string;
  invoice_number: string;
  patient_name: string;
  total_amount: number;
  remaining_balance: number;
  created_at: string;
}

interface PaymentFormData {
  invoiceId: string;
  amount: string;
  method: "cash" | "mobile_money" | "insurance";
  phone: string;
  notes: string;
}

interface DashboardRecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DashboardRecordPaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: DashboardRecordPaymentModalProps) {
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    invoiceId: "",
    amount: "",
    method: "cash",
    phone: "",
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pollingPayment, setPollingPayment] = useState(false);

  // Fetch pending invoices when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPendingInvoices();
    }
  }, [isOpen]);

  // Poll payment status for mobile money payments
  const pollPaymentStatus = async (paymentId: number) => {
    setPollingPayment(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await api.payments.getPaymentStatus(paymentId);
        
        if (statusResponse.status === 'confirmed' || statusResponse.status === 'failed') {
          clearInterval(pollInterval);
          setPollingPayment(false);
          
          // Reset form and close modal
          setFormData({
            invoiceId: "",
            amount: "",
            method: "cash",
            phone: "",
            notes: ""
          });
          
          onClose();
          onSuccess?.();
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        clearInterval(pollInterval);
        setPollingPayment(false);
      }
    }, 30000); // Poll every 30 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPollingPayment(false);
    }, 300000); // 5 minutes
  };

  const fetchPendingInvoices = async () => {
    try {
      setFetchingInvoices(true);
      const response = await api.invoices.listInvoices({ 
        status: "pending",
        limit: 100 
      });
      
      const transformedInvoices = (response.data || []).map((invoice: any) => ({
        id: invoice.id.toString(),
        invoice_number: invoice.invoice_number,
        patient_name: invoice.visit?.patient?.full_name || 'Unknown Patient',
        total_amount: invoice.total_amount || 0,
        remaining_balance: invoice.remaining_balance || 0,
        created_at: invoice.created_at
      }));
      
      setPendingInvoices(transformedInvoices);
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
      setPendingInvoices([]);
    } finally {
      setFetchingInvoices(false);
    }
  };

  const selectedInvoice = pendingInvoices.find(inv => inv.id === formData.invoiceId);

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = pendingInvoices.find(inv => inv.id === invoiceId);
    setFormData(prev => ({
      ...prev,
      invoiceId,
      amount: invoice?.remaining_balance.toString() || "0"
    }));
    setErrors(prev => ({ ...prev, invoiceId: "", amount: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.invoiceId) {
      newErrors.invoiceId = "Please select an invoice";
    }

    // Amount validation - matching backend specifications
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(formData.amount)) {
      newErrors.amount = "Amount must be in valid currency format (e.g., 10000.50)";
    } else if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.remaining_balance) {
      newErrors.amount = `Amount cannot exceed remaining balance of RWF ${selectedInvoice.remaining_balance.toLocaleString()}`;
    }

    // Phone validation for mobile money - Rwanda format as specified
    if (formData.method === "mobile_money") {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required for mobile money payments";
      } else if (!/^\+2507\d{8}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be a valid Rwanda number (+2507xxxxxxxx)";
      }
    }

    // Insurance validation
    if (formData.method === "insurance" && !formData.phone) {
      newErrors.phone = "Insurance provider ID is required for insurance payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Transform frontend data to backend format
      const backendPaymentData = {
        amount: formData.amount,
        method: formData.method,
        notes: formData.notes,
        ...(formData.method === 'mobile_money' && { phone: formData.phone }),
        ...(formData.method === 'insurance' && { insurance_id: formData.phone }), // Using phone field for insurance ID for now
      };

      const response = await api.payments.processPayment(parseInt(formData.invoiceId), backendPaymentData);
      
      // Handle mobile money status polling if needed
      if (response.data?.status === 'pending' && response.data?.method === 'mobile_money') {
        // Start polling for payment status updates
        pollPaymentStatus(response.data.id);
      } else {
        // Reset form and close for confirmed payments
        setFormData({
          invoiceId: "",
          amount: "",
          method: "cash",
          phone: "",
          notes: ""
        });
        
        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Error recording payment:', error);
      
      // Check for specific backend webhook error
      if (error.message?.includes('Route [webhooks.efichepay] not defined')) {
        setErrors({ general: 'Backend webhook not configured. Please contact administrator to set up payment webhooks.' });
      } else {
        setErrors({ general: error.message || 'Payment failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Record Payment</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Invoice Selection */}
            <div>
              <label htmlFor="invoice" className="block text-sm font-medium text-neutral-700 mb-2">
                Select Invoice *
              </label>
              <select
                id="invoice"
                value={formData.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                disabled={fetchingInvoices}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                  errors.invoiceId ? "border-error-300" : "border-neutral-300"
                }`}
              >
                <option value="">
                  {fetchingInvoices ? "Loading invoices..." : "Select an invoice"}
                </option>
                {pendingInvoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {invoice.patient_name} - RWF {invoice.remaining_balance.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.invoiceId && (
                <p className="mt-1 text-sm text-error-600">{errors.invoiceId}</p>
              )}
            </div>

            {/* Invoice Details */}
            {selectedInvoice && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Invoice Number:</span>
                    <p className="font-medium">{selectedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <span className="text-neutral-600">Patient:</span>
                    <p className="font-medium">{selectedInvoice.patient_name}</p>
                  </div>
                  <div>
                    <span className="text-neutral-600">Total Amount:</span>
                    <p className="font-medium">RWF {selectedInvoice.total_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-neutral-600">Remaining Balance:</span>
                    <p className="font-bold text-primary-600">RWF {selectedInvoice.remaining_balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neutral-500 sm:text-sm">RWF</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  disabled={!selectedInvoice || loading}
                  step="0.01"
                  min="0"
                  max={selectedInvoice?.remaining_balance || 0}
                  className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                    errors.amount ? "border-error-300" : "border-neutral-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-error-600">{errors.amount}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Method *
              </label>
              <select
                id="method"
                value={formData.method}
                onChange={(e) => handleInputChange("method", e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                  errors.method ? "border-error-300" : "border-neutral-300"
                }`}
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="insurance">Insurance</option>
              </select>
              {errors.method && (
                <p className="mt-1 text-sm text-error-600">{errors.method}</p>
              )}
            </div>

            {/* Phone Number (for Mobile Money) */}
            {formData.method === "mobile_money" && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                  placeholder="+250788123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                    errors.phone ? "border-error-300" : "border-neutral-300"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-sm text-neutral-500">
                  Enter the phone number for mobile money payment
                </p>
              </div>
            )}

            {/* Insurance ID (for Insurance) */}
            {formData.method === "insurance" && (
              <div>
                <label htmlFor="insurance" className="block text-sm font-medium text-neutral-700 mb-2">
                  Insurance ID *
                </label>
                <input
                  type="text"
                  id="insurance"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                  placeholder="Enter insurance provider ID"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                    errors.phone ? "border-error-300" : "border-neutral-300"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-sm text-neutral-500">
                  Enter the insurance provider ID or reference
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                placeholder="Add any notes about this payment..."
              />
            </div>

            {/* Payment Summary */}
            {selectedInvoice && formData.amount && (
              <div className="bg-primary-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Invoice:</span>
                    <span className="font-medium">{selectedInvoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Method:</span>
                    <span className="font-medium capitalize">{formData.method.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Amount:</span>
                    <span className="font-bold text-primary-600">RWF {parseFloat(formData.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Remaining after payment:</span>
                    <span className="font-medium">RWF {(selectedInvoice.remaining_balance - parseFloat(formData.amount)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || pollingPayment}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || pollingPayment || !selectedInvoice || !formData.amount || parseFloat(formData.amount) <= 0}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : pollingPayment ? "Waiting for confirmation..." : "Record Payment"}
              </button>
            </div>

            {/* Mobile Money Status Indicator */}
            {pollingPayment && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-800">
                    Mobile money payment initiated. Waiting for confirmation...
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
