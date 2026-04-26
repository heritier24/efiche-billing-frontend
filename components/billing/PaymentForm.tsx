/**
 * Payment Form Component
 * Handles payment submission with method selection
 * Estate Rwanda Design - 60-30-10 Color Scheme
 */

"use client";

import { useState } from "react";
import { Invoice, Insurance, PaymentMethod, PaymentFormData } from "@/lib/types";

interface PaymentFormProps {
  invoice: Invoice;
  insurances: Insurance[];
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
  isWaitingForConfirmation: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export default function PaymentForm({
  invoice,
  insurances,
  onSubmit,
  isLoading,
  isWaitingForConfirmation,
  successMessage,
  errorMessage,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: invoice.remainingBalance,
    method: "cash",
    insuranceId: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (formData.amount > invoice.remainingBalance) {
      alert(
        `Amount cannot exceed remaining balance of RWF ${invoice.remainingBalance.toLocaleString()}`
      );
      return;
    }

    if (formData.method === "insurance" && !formData.insuranceId) {
      alert("Please select an insurance provider");
      return;
    }

    onSubmit(formData);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, amount: value }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value as PaymentMethod;
    setFormData((prev) => ({
      ...prev,
      method,
      insuranceId: method === "insurance" ? prev.insuranceId : undefined,
    }));
  };

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, insuranceId: e.target.value }));
  };

  if (invoice.status === "paid") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="bg-success-50 border border-success-300 rounded-lg p-4">
          <p className="text-success-700 font-semibold">
            ✓ Invoice paid in full. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Process Payment</h2>

      {/* Status Messages */}
      {isWaitingForConfirmation && (
        <div className="mb-4 bg-info-50 border border-primary-300 rounded-lg p-4">
          <p className="text-primary-700 font-semibold">
            ⏳ Waiting for mobile money confirmation...
          </p>
          <p className="text-primary-600 text-sm mt-1">
            This may take a few seconds.
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-success-50 border border-success-300 rounded-lg p-4">
          <p className="text-success-700 font-semibold">✓ {successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-error-50 border border-error-300 rounded-lg p-4">
          <p className="text-error-700 font-semibold">✗ {errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-neutral-900 mb-2">
            Amount to Pay (RWF) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-neutral-700 font-semibold">
              RWF
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={invoice.remainingBalance}
              value={formData.amount || ""}
              onChange={handleAmountChange}
              disabled={isLoading || isWaitingForConfirmation}
              className="w-full pl-14 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 text-neutral-900"
              required
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Balance: RWF {invoice.remainingBalance.toLocaleString()}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label
            htmlFor="method"
            className="block text-sm font-semibold text-neutral-900 mb-2"
          >
            Payment Method *
          </label>
          <select
            id="method"
            value={formData.method}
            onChange={handleMethodChange}
            disabled={isLoading || isWaitingForConfirmation}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 text-neutral-900 bg-white"
            required
          >
            <option value="cash">💵 Cash</option>
            <option value="mobile_money">📱 Mobile Money</option>
            <option value="insurance">🏥 Insurance</option>
          </select>
        </div>

        {/* Insurance Selection (conditional) */}
        {formData.method === "insurance" && (
          <div>
            <label
              htmlFor="insurance"
              className="block text-sm font-semibold text-neutral-900 mb-2"
            >
              Select Insurance Provider *
            </label>
            <select
              id="insurance"
              value={formData.insuranceId || ""}
              onChange={handleInsuranceChange}
              disabled={isLoading || isWaitingForConfirmation}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 text-neutral-900 bg-white"
              required
            >
              <option value="">Select Insurance...</option>
              {insurances.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name} ({ins.coveragePercentage}% coverage)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isWaitingForConfirmation}
          className="w-full mt-8 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold rounded-lg transition-colors text-center"
        >
          {isLoading
            ? "Processing..."
            : isWaitingForConfirmation
              ? "Waiting for Confirmation..."
              : `Pay RWF ${formData.amount.toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}
