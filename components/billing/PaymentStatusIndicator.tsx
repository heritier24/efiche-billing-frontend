/**
 * Payment Status Indicator Component
 * Shows clear payment status with appropriate icons and colors
 */

import { ReactNode } from "react";

interface PaymentStatusIndicatorProps {
  status: "pending" | "confirmed" | "failed" | "processing";
  message: string;
  children?: ReactNode;
}

export default function PaymentStatusIndicator({ 
  status, 
  message, 
  children 
}: PaymentStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          icon: "⏳",
        };
      case "confirmed":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          icon: "✅",
        };
      case "failed":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          icon: "❌",
        };
      case "processing":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          icon: "🔄",
        };
      default:
        return {
          bgColor: "bg-neutral-50",
          borderColor: "border-neutral-200",
          textColor: "text-neutral-800",
          icon: "ℹ️",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
      <div className="flex items-center">
        <span className="text-xl mr-3">{config.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
