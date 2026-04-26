/**
 * Invoice Summary Component
 * Displays invoice header info: visit ID, status, amounts
 */

import { Invoice } from "@/lib/types";

interface InvoiceSummaryProps {
  invoice: Invoice;
}

export default function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Invoice Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Invoice ID</p>
              <p className="text-base font-medium text-gray-900">
                {invoice.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Visit ID</p>
              <p className="text-base font-medium text-gray-900">
                {invoice.visitId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient Name</p>
              <p className="text-base font-medium text-gray-900">
                {invoice.patientName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status & Amounts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}
              >
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-base font-semibold text-gray-900">
                  KES {invoice.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-base font-medium text-green-600">
                  KES {invoice.amountPaid.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                <p className="text-sm font-medium text-gray-900">
                  Remaining Balance
                </p>
                <p className="text-lg font-bold text-red-600">
                  KES {invoice.remainingBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
