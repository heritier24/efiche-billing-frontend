"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/backend";

// Import ApiError class for error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface SimplePaymentFormData {
  amount: string;
  method: "cash" | "mobile_money" | "insurance";
  phone_number: string;
  notes: string;
}

interface SimplePaymentFormProps {
  invoiceId: number;
  remainingBalance?: number;
  onPaymentSuccess?: (payment: any) => void;
  onClose?: () => void;
}

export default function SimplePaymentForm({ invoiceId, remainingBalance, onPaymentSuccess, onClose }: SimplePaymentFormProps) {
  const [formData, setFormData] = useState<SimplePaymentFormData>({
    amount: '',
    method: 'cash',
    phone_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Amount validation - matching backend specifications
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(formData.amount)) {
      newErrors.amount = "Amount must be in valid currency format (e.g., 10000.50)";
    } else if (remainingBalance && parseFloat(formData.amount) > remainingBalance) {
      newErrors.amount = `Amount cannot exceed remaining balance of RWF ${remainingBalance.toLocaleString()}`;
    }

    // Method validation
    if (!formData.method) {
      newErrors.method = "Please select a payment method";
    }

    // Phone validation for mobile money - Rwanda format as specified
    if (formData.method === "mobile_money") {
      if (!formData.phone_number) {
        newErrors.phone_number = "Phone number is required for mobile money payments";
      } else if (!/^\+2507\d{8}$/.test(formData.phone_number)) {
        newErrors.phone_number = "Phone number must be a valid Rwanda number (+2507xxxxxxxx)";
      }
    }

    // Insurance validation
    if (formData.method === "insurance" && !formData.phone_number) {
      newErrors.insurance = "Insurance provider ID is required for insurance payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, remainingBalance]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const paymentData = {
        amount: formData.amount,
        method: formData.method,
        phone: formData.phone_number,
        notes: formData.notes
      };

      const payment = await api.payments.processPayment(invoiceId, paymentData);
      
      if (payment) {
        onPaymentSuccess?.(payment);
        onClose?.();
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      
      if (error instanceof ApiError) {
      // Handle specific API errors
      if (error.status === 404) {
        setErrors({ general: 'Payment endpoint not found. Please check backend configuration.' });
      } else if (error.status === 422) {
        // Validation errors
        const validationErrors = error.details;
        if (validationErrors) {
          setErrors(validationErrors);
        } else {
          setErrors({ general: 'Invalid payment data. Please check your input.' });
        }
      } else if (error.status === 500) {
        // Check for specific backend webhook error
        if (error.message?.includes('Route [webhooks.efichepay] not defined')) {
          setErrors({ general: 'Backend webhook not configured. Please contact administrator to set up payment webhooks.' });
        } else {
          setErrors({ general: 'Server error. Please try again later.' });
        }
      } else {
        setErrors({ general: error.message || 'Payment failed. Please try again.' });
      }
    } else {
      setErrors({ general: 'Payment failed. Please try again.' });
    }
    } finally {
      setLoading(false);
    }
  }, [formData, invoiceId, validateForm, onPaymentSuccess, onClose]);

  const handleInputChange = useCallback((field: keyof SimplePaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Remaining Balance Display */}
      {remainingBalance !== undefined && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">Remaining Balance:</span>
            <span className="text-lg font-bold text-neutral-900">RWF {remainingBalance.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Payment Amount (RWF) *
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 font-medium placeholder-neutral-400"
          placeholder="0.00"
          style={{ fontSize: '16px', lineHeight: '1.5' }}
          required
        />
        {errors.amount && (
          <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Payment Method *
        </label>
        <select
          value={formData.method}
          onChange={(e) => handleInputChange('method', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 font-medium"
          style={{ fontSize: '16px', lineHeight: '1.5' }}
          required
        >
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="insurance">Insurance</option>
        </select>
      </div>

      {formData.method === 'mobile_money' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 font-medium placeholder-neutral-400"
            placeholder="+250788123456"
            style={{ fontSize: '16px', lineHeight: '1.5' }}
            required
          />
          {errors.phone_number && (
            <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            Format: +2507xxxxxxxx (Rwanda numbers only)
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 font-medium placeholder-neutral-400"
          rows={3}
          placeholder="Add any notes about this payment..."
          style={{ fontSize: '16px', lineHeight: '1.5' }}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay RWF ${formData.amount || '0.00'}`}
        </button>
      </div>
    </form>
  );
}
