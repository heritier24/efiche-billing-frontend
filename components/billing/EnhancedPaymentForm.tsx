/**
 * Enhanced Payment Form Component
 * Includes validation, better UX, and error handling
 */

"use client";

import { useState, useEffect } from "react";
import { BackendInvoice, BackendInsurance, PaymentMethod, PaymentRequest } from "@/lib/types";

interface PaymentFormProps {
  invoice: BackendInvoice;
  insurances: BackendInsurance[];
  onSubmit: (data: PaymentRequest) => void;
  isLoading: boolean;
  isWaitingForConfirmation: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface FormErrors {
  amount?: string;
  method?: string;
  insurance?: string;
  phone?: string;
}

interface MobileMoneyProgress {
  step: 1 | 2 | 3 | 4;
  message: string;
}

export default function EnhancedPaymentForm({
  invoice,
  insurances,
  onSubmit,
  isLoading,
  isWaitingForConfirmation,
  successMessage,
  errorMessage,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: invoice.remaining_balance?.toString() || "0",
    method: "cash" as PaymentMethod,
    insuranceId: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mobile money progress states
  const [mobileProgress, setMobileProgress] = useState<MobileMoneyProgress>({
    step: 1,
    message: "Initiating payment..."
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (parseFloat(formData.amount) > (invoice.remaining_balance || 0)) {
      newErrors.amount = `Amount cannot exceed remaining balance (RWF ${(invoice.remaining_balance || 0).toLocaleString()})`;
    }

    // Method validation
    if (!formData.method) {
      newErrors.method = "Please select a payment method";
    }

    // Insurance validation
    if (formData.method === "insurance" && !formData.insuranceId) {
      newErrors.insurance = "Please select an insurance provider";
    }

    // Phone validation for mobile money
    if (formData.method === "mobile_money") {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required for mobile money";
      } else if (!/^(\+250)?7[389]\d{7}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Please enter a valid Rwanda phone number (e.g., +250788123456)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate this field on blur
    if (field === "amount") {
      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        setErrors(prev => ({ ...prev, amount: "Amount must be greater than 0" }));
      } else if (amount > (invoice.remaining_balance || 0)) {
        setErrors(prev => ({ 
          ...prev, 
          amount: `Amount cannot exceed remaining balance (RWF ${(invoice.remaining_balance || 0).toLocaleString()})` 
        }));
      } else {
        setErrors(prev => ({ ...prev, amount: undefined }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare payment request data
    const paymentRequest: PaymentRequest = {
      amount: parseFloat(formData.amount).toFixed(2),
      method: formData.method,
      notes: formData.notes,
      ...(formData.method === "mobile_money" && { phone: formData.phone }),
      ...(formData.method === "insurance" && { insuranceId: formData.insuranceId }),
    };

    onSubmit(paymentRequest);
  };

  // Mobile money progress simulation
  useEffect(() => {
    if (isWaitingForConfirmation) {
      const progressSteps: MobileMoneyProgress[] = [
        { step: 1, message: "Initiating mobile money payment..." },
        { step: 2, message: "Sending payment request to provider..." },
        { step: 3, message: "Waiting for customer confirmation..." },
        { step: 4, message: "Processing payment confirmation..." },
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < progressSteps.length - 1) {
          currentStep++;
          setMobileProgress(progressSteps[currentStep]);
        } else {
          clearInterval(interval);
        }
      }, 3000);

      setMobileProgress(progressSteps[0]);

      return () => clearInterval(interval);
    }
  }, [isWaitingForConfirmation]);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">Process Payment</h3>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-success-50 border border-success-300 rounded-lg">
          <p className="text-success-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-error-50 border border-error-300 rounded-lg">
          <p className="text-error-700 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Mobile Money Progress */}
      {isWaitingForConfirmation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800 font-medium">{mobileProgress.message}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(mobileProgress.step / 4) * 100}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-blue-600 mt-2">
            Please check your phone for the payment confirmation prompt.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-2">
            Payment Amount (RWF)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
              RWF
            </span>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              onBlur={() => handleFieldBlur("amount")}
              disabled={isLoading || isWaitingForConfirmation}
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                errors.amount ? "border-error-300" : "border-neutral-300"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={invoice.remaining_balance || 0}
            />
          </div>
          {errors.amount && touched.amount && (
            <p className="mt-1 text-sm text-error-600">{errors.amount}</p>
          )}
          <p className="mt-1 text-sm text-neutral-500">
            Remaining balance: RWF {(invoice.remaining_balance || 0).toLocaleString()}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-neutral-700 mb-2">
            Payment Method
          </label>
          <select
            id="method"
            value={formData.method}
            onChange={(e) => handleInputChange("method", e.target.value)}
            disabled={isLoading || isWaitingForConfirmation}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
              errors.method ? "border-error-300" : "border-neutral-300"
            }`}
          >
            <option value="">Select payment method</option>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="insurance">Insurance</option>
          </select>
          {errors.method && touched.method && (
            <p className="mt-1 text-sm text-error-600">{errors.method}</p>
          )}
        </div>

        {/* Mobile Money Phone Number */}
        {formData.method === "mobile_money" && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={() => handleFieldBlur("phone")}
              disabled={isLoading || isWaitingForConfirmation}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                errors.phone ? "border-error-300" : "border-neutral-300"
              }`}
              placeholder="+250788123456"
            />
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-sm text-neutral-500">
              Enter Rwanda phone number (e.g., +250788123456)
            </p>
          </div>
        )}

        {/* Insurance Selection */}
        {formData.method === "insurance" && (
          <div>
            <label htmlFor="insurance" className="block text-sm font-medium text-neutral-700 mb-2">
              Insurance Provider
            </label>
            <select
              id="insurance"
              value={formData.insuranceId}
              onChange={(e) => handleInputChange("insuranceId", e.target.value)}
              disabled={isLoading || isWaitingForConfirmation}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                errors.insurance ? "border-error-300" : "border-neutral-300"
              }`}
            >
              <option value="">Select insurance provider</option>
              {insurances.map((insurance) => (
                <option key={insurance.id} value={insurance.id}>
                  {insurance.name}
                </option>
              ))}
            </select>
            {errors.insurance && touched.insurance && (
              <p className="mt-1 text-sm text-error-600">{errors.insurance}</p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            disabled={isLoading || isWaitingForConfirmation}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isWaitingForConfirmation}
          className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : isWaitingForConfirmation ? "Waiting for Confirmation..." : "Process Payment"}
        </button>
      </form>
    </div>
  );
}
