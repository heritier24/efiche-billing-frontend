"use client";

import { memo } from "react";
import SimplePaymentForm from "./SimplePaymentForm";

interface PaymentModalProps {
  isOpen: boolean;
  invoiceId: number;
  remainingBalance?: number;
  onPaymentSuccess?: (payment: any) => void;
  onClose?: () => void;
}

const PaymentModal = memo(({ isOpen, invoiceId, remainingBalance, onPaymentSuccess, onClose }: PaymentModalProps) => {
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Process Payment</h2>
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
          
          <div className="p-6">
            <SimplePaymentForm
              invoiceId={invoiceId}
              remainingBalance={remainingBalance}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentModal.displayName = "PaymentModal";

export default PaymentModal;
