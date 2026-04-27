/**
 * Payment Form Component
 */

"use client";

import { useState } from "react";
import { api } from "@/lib/api/backend";

interface PaymentFormData {
  amount: string;
  method: "cash" | "mobile_money" | "insurance";
  phone_number?: string;
  notes?: string;
}

interface PaymentFormProps {
  invoiceId: number;
  onPaymentSuccess?: (payment: any) => void;
  onClose?: () => void;
}

export default function PaymentForm({ invoiceId, onPaymentSuccess, onClose }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    method: 'cash',
    phone_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Currency format validation
    if (formData.amount && !/^\d{1,8}(\.\d{1,2})?$/.test(formData.amount)) {
      newErrors.amount = 'Amount must be in valid currency format (e.g., 10000.50)';
    }

    // Phone validation for mobile money
    if (formData.method === 'mobile_money') {
      if (!formData.phone_number) {
        newErrors.phone_number = 'Phone number is required for mobile money payments';
      } else if (!/^\+2507\d{8}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number must be a valid Rwanda number (+2507xxxxxxxx)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const paymentData = {
        amount: formData.amount,
        method: formData.method,
        phone_number: formData.phone_number,
        notes: formData.notes
      };

      const response = await api.payments.processPayment(invoiceId, paymentData);
      
      if (response) {
        onPaymentSuccess?.(response);
        onClose?.();
        setFormData({
          amount: '',
          method: 'cash',
          phone_number: '',
          notes: ''
        });
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        alert('Payment failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev: PaymentFormData) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      mobile_money: '📱',
      insurance: '🏥'
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      cash: 'Cash',
      mobile_money: 'Mobile Money',
      insurance: 'Insurance'
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (!invoiceId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Process Payment</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 p-2 rounded-md hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount (RWF) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500 ${
                  errors.amount ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="0.00"
                required
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Method *
              </label>
              <select
                value={formData.method}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900"
                required
              >
                <option value="cash">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMethodIcon('cash')}</span>
                    <span>Cash</span>
                  </div>
                </option>
                <option value="mobile_money">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMethodIcon('mobile_money')}</span>
                    <span>Mobile Money</span>
                  </div>
                </option>
                <option value="insurance">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMethodIcon('insurance')}</span>
                    <span>Insurance</span>
                  </div>
                </option>
              </select>
            </div>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500 ${
                  errors.phone_number ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="+250788123456"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (Optional)
              </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-neutral-900 placeholder-neutral-500"
              placeholder="Add any notes about this payment..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !validateForm()}
              className="px-4 py-2 bg-primary-600 text-white border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay ${formData.amount ? new Intl.NumberFormat('rw-RW', {
                style: 'currency',
                currency: 'RWF'
              }).format(parseFloat(formData.amount)) : '0.00'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
