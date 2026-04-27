/**
 * Invoice Summary Component
 * Displays invoice header info: visit ID, status, amounts
 * Estate Rwanda Design - 60-30-10 Color Scheme
 */

import { BackendInvoice } from "@/lib/types";

interface InvoiceSummaryProps {
  invoice: BackendInvoice;
}

export default function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-50 text-success-700 border border-success-500";
      case "partially_paid":
        return "bg-warning-50 text-warning-700 border border-warning-500";
      case "pending":
        return "bg-error-50 text-error-700 border border-error-500";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Invoice Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Invoice Info */}
        <div className="space-y-4">
          <div className="border-b border-neutral-200 pb-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Invoice ID</p>
            <p className="text-lg font-semibold text-neutral-900">{invoice.id}</p>
          </div>

          <div className="border-b border-neutral-200 pb-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Visit ID</p>
            <p className="text-base font-medium text-neutral-700">{invoice.visit_id}</p>
          </div>

          <div className="border-b border-neutral-200 pb-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Patient Name</p>
            <p className="text-base font-medium text-neutral-700">
              {invoice.visit?.patient?.full_name || 'Unknown Patient'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Date</p>
            <p className="text-base font-medium text-neutral-700">
              {new Date(invoice.created_at?.split('T')[0] || new Date()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right: Status & Amounts */}
        <div className="space-y-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-neutral-600 mb-2">Status</p>
            <span className={`inline-block px-4 py-2 rounded-md text-sm font-semibold ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Total Amount</p>
              <p className="text-lg font-bold text-neutral-900">
                RWF {(invoice.total_amount || 0).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
              <p className="text-sm text-neutral-600">Amount Paid</p>
              <p className="text-base font-semibold text-success-600">
                RWF {(invoice.total_paid || 0).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-3 flex items-center justify-between bg-error-50 -m-4 p-4 rounded-md">
              <p className="text-sm font-semibold text-neutral-900">Remaining Balance</p>
              <p className="text-xl font-bold text-error-600">
                RWF {(invoice.remaining_balance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
