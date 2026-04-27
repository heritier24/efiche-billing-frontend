"use client";

import { memo } from "react";
import PaymentForm from "./Payment-form";

interface PaymentFormWrapperProps {
  invoiceId: number;
  onPaymentSuccess?: (payment: any) => void;
  onClose?: () => void;
}

const PaymentFormWrapper = memo(({ invoiceId, onPaymentSuccess, onClose }: PaymentFormWrapperProps) => {
  return (
    <PaymentForm
      invoiceId={invoiceId}
      onPaymentSuccess={onPaymentSuccess}
      onClose={onClose}
    />
  );
});

PaymentFormWrapper.displayName = "PaymentFormWrapper";

export default PaymentFormWrapper;
