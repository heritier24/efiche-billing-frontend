/**
 * Payment Form Component
 * Handles payment submission with method selection
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

    // Validation
    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (formData.amount > invoice.remainingBalance) {
      alert(
        `Amount cannot exceed remaining balance of KES ${invoice.remainingBalance.toFixed(2)}`
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

  // If invoice is already fully paid, show success message
  if (invoice.status === "paid") {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✓ Invoice paid in full. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment</h2>

      {/* Status Messages */}
      {isWaitingForConfirmation && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            ⏳ Waiting for mobile money confirmation...
          </p>
          <p className="text-blue-700 text-sm mt-1">
            This may take a few seconds.
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✓ {successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">✗ {errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
            Amount to Pay *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-600 font-medium">
              KES
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
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Remaining: KES {invoice.remainingBalance.toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label
            htmlFor="method"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Payment Method *
          </label>
          <select
            id="method"
            value={formData.method}
            onChange={handleMethodChange}
            disabled={isLoading || isWaitingForConfirmation}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
          >
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>

        {/* Insurance Selection (conditional) */}
        {formData.method === "insurance" && (
          <div>
            <label
              htmlFor="insurance"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Insurance Provider *
            </label>
            <select
              id="insurance"
              value={formData.insuranceId || ""}
              onChange={handleInsuranceChange}
              disabled={isLoading || isWaitingForConfirmation}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
          disabled={
            isLoading ||
            isWaitingForConfirmation
          }
          className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading
            ? "Processing..."
            : isWaitingForConfirmation
              ? "Waiting for Confirmation..."
              : `Pay KES ${formData.amount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
