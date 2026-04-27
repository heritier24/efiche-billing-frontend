/**
 * Payment List Component
 */

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/backend";

interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  method: string;
  status: string;
  transaction_ref: string;
  processed_at: string;
  confirmed_at?: string;
  cashier_id?: number;
  notes?: string;
  invoice: {
    id: number;
    invoice_number: string;
    patient_name: string;
  };
}

interface PaymentListProps {
  onPaymentSelect?: (payment: Payment) => void;
}

export default function PaymentList({ onPaymentSelect }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const params = filter === 'all' 
        ? {} 
        : { status: filter };
      
      const response = await api.payments.getAllPayments(params);
      
      // Transform backend data to frontend format
      const transformedPayments = (response.data || []).map((payment) => ({
        id: payment.id,
        invoiceId: payment.invoice_id?.toString() || '',
        invoice_id: payment.invoice_id,
        patientName: 'Unknown Patient', // BackendPayment no longer has nested invoice
        amount: payment.amount || 0,
        method: payment.method as "cash" | "mobile_money" | "insurance",
        phoneNumber: payment.phone || '',
        status: (payment.status === 'confirmed' ? 'completed' : payment.status) as "pending" | "completed" | "failed",
        timestamp: payment.created_at || '',
        processed_at: payment.created_at || '',
        confirmationCode: payment.transaction_ref || '',
        transaction_ref: payment.transaction_ref || '',
        processedBy: payment.cashier_id?.toString() || 'Unknown',
        notes: payment.notes,
        invoice: { // Provide mock invoice object to satisfy frontend type
          id: payment.invoice_id,
          invoice_number: `INV-${payment.invoice_id}`,
          patient_name: 'Unknown Patient'
        }
      }));
      
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { bg: 'bg-success-100', text: 'text-success-800' },
      pending: { bg: 'bg-warning-100', text: 'text-warning-800' },
      failed: { bg: 'bg-error-100', text: 'text-error-800' },
      cancelled: { bg: 'bg-neutral-100', text: 'text-neutral-800' }
    };
    const badge = badges[status as keyof typeof badges] || { bg: 'bg-neutral-100', text: 'text-neutral-800' };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`;
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      mobile_money: '📱',
      insurance: '🏥'
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-neutral-600 mt-4">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-3 py-1 rounded ${filter === 'confirmed' ? 'bg-success-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-warning-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-3 py-1 rounded ${filter === 'failed' ? 'bg-error-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}
        >
          Failed
        </button>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Transaction Ref
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {payment.transaction_ref || `PAY-${payment.id}`}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {payment.invoice?.invoice_number} - {payment.invoice?.patient_name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">
                    <span className={getStatusColor(payment.status)}>
                      {new Intl.NumberFormat('rw-RW', {
                        style: 'currency',
                        currency: 'RWF'
                      }).format(payment.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-500">
                        {getMethodIcon(payment.method)}
                      </span>
                      <span className="text-sm capitalize">
                        {payment.method.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {new Date(payment.processed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onPaymentSelect?.(payment)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Invoice
                      </button>
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payments.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No payments found</h3>
            <p className="text-neutral-600">No payments have been processed yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
