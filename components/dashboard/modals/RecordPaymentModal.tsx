/**
 * Record Payment Modal Component
 */

"use client";

import { useState } from "react";

interface Payment {
  invoiceId: string;
  amount: number;
  method: "cash" | "mobile_money" | "insurance";
  insuranceId?: string;
  phoneNumber?: string;
  notes?: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Payment) => void;
  invoices: Array<{ id: string; patientName: string; totalAmount: number; remainingBalance: number }>;
  insurances: Array<{ id: string; name: string; code: string }>;
}

export default function RecordPaymentModal({ isOpen, onClose, onSubmit, invoices, insurances }: RecordPaymentModalProps) {
  const [formData, setFormData] = useState<Payment>({
    invoiceId: "",
    amount: 0,
    method: "cash",
    insuranceId: "",
    phoneNumber: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    setFormData(prev => ({
      ...prev,
      invoiceId,
      amount: invoice?.remainingBalance || 0,
    }));
  };

  const handleMethodChange = (method: Payment["method"]) => {
    setFormData(prev => ({
      ...prev,
      method,
      insuranceId: method === "insurance" ? "" : prev.insuranceId,
      phoneNumber: method === "mobile_money" ? "" : prev.phoneNumber,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        invoiceId: "",
        amount: 0,
        method: "cash",
        insuranceId: "",
        phoneNumber: "",
        notes: "",
      });
      onClose();
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Record Payment</h2>
          <p className="text-neutral-600 mt-1">Process payment for patient invoice</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Invoice *
            </label>
            <select
              value={formData.invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose an invoice</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.id} - {invoice.patientName} (Balance: RWF {invoice.remainingBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Details */}
          {selectedInvoice && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Patient:</span>
                  <span className="ml-2 font-medium">{selectedInvoice.patientName}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Total Amount:</span>
                  <span className="ml-2 font-medium">RWF {selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Remaining Balance:</span>
                  <span className="ml-2 font-medium text-primary-600">RWF {selectedInvoice.remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "cash", label: "Cash", icon: "💵" },
                { value: "mobile_money", label: "Mobile Money", icon: "📱" },
                { value: "insurance", label: "Insurance", icon: "🏥" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.method === method.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.value}
                    checked={formData.method === method.value}
                    onChange={(e) => handleMethodChange(e.target.value as Payment["method"])}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                  {formData.method === method.value && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-600"></div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Fields */}
          {formData.method === "insurance" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Insurance Provider *
              </label>
              <select
                value={formData.insuranceId}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceId: e.target.value }))}
                required={formData.method === "insurance"}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select insurance provider</option>
                {insurances.map(insurance => (
                  <option key={insurance.id} value={insurance.id}>
                    {insurance.name} ({insurance.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.method === "mobile_money" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required={formData.method === "mobile_money"}
                placeholder="+250 7XX XXX XXX"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Payment Amount (RWF) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={selectedInvoice?.remainingBalance || 0}
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
            {selectedInvoice && (
              <p className="text-sm text-neutral-600 mt-1">
                Maximum amount: RWF {selectedInvoice.remainingBalance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Payment Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional notes about this payment"
            />
          </div>

          {/* Summary */}
          {formData.amount > 0 && selectedInvoice && (
            <div className="border-t border-neutral-200 pt-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Invoice:</span>
                    <span className="font-medium">{selectedInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Method:</span>
                    <span className="font-medium capitalize">{formData.method.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Amount:</span>
                    <span className="font-bold text-primary-600">RWF {formData.amount.toLocaleString()}</span>
                  </div>
                  {selectedInvoice && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Remaining after payment:</span>
                      <span className="font-medium">RWF {(selectedInvoice.remainingBalance - formData.amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedInvoice || formData.amount <= 0 || formData.amount > selectedInvoice.remainingBalance}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
