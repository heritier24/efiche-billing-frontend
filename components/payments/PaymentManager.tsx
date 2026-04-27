"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api/backend";
import { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

interface PaymentManagerProps {
  onPaymentSuccess?: (payment: Payment) => void;
  className?: string;
}

interface PaymentFilters {
  searchTerm: string;
  status: string;
  method: string;
  dateRange: string;
}

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  averagePayment: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  methodBreakdown: Record<string, { count: number; total: number; percentage: number }>;
}

export default function PaymentManager({ onPaymentSuccess, className = "" }: PaymentManagerProps) {
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    searchTerm: "",
    status: "all",
    method: "all",
    dateRange: "all"
  });
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);

  // Fetch payments with filters
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit: 100
      };

      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }
      if (filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.method !== "all") {
        params.method = filters.method;
      }
      if (filters.dateRange !== "all") {
        // Add date range parameters
        const today = new Date();
        if (filters.dateRange === "today") {
          params.date_from = today.toISOString().split('T')[0];
          params.date_to = today.toISOString().split('T')[0];
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.date_from = weekAgo.toISOString().split('T')[0];
          params.date_to = today.toISOString().split('T')[0];
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.date_from = monthAgo.toISOString().split('T')[0];
          params.date_to = today.toISOString().split('T')[0];
        }
      }

      const response = await api.payments.getAllPayments(params);
      setPayments(response.data || []);
      
      // Calculate stats
      const stats = calculatePaymentStats(response.data || []);
      setPaymentStats(stats);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Calculate payment statistics
  const calculatePaymentStats = useCallback((paymentData: Payment[]): PaymentStats => {
    const totalPayments = paymentData.length;
    const totalRevenue = paymentData.reduce((sum, p) => sum + (p.amount || 0), 0);
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;
    
    const statusCounts = paymentData.reduce((acc, p) => {
      const status = p.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const methodCounts = paymentData.reduce((acc, p) => {
      const method = p.method || 'unknown';
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += p.amount || 0;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const methodBreakdown = Object.entries(methodCounts).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0
    }));

    return {
      totalPayments,
      totalRevenue,
      averagePayment,
      pendingPayments: statusCounts.pending || 0,
      completedPayments: statusCounts.completed || 0,
      failedPayments: statusCounts.failed || 0,
      methodBreakdown: methodBreakdown.reduce((acc, item) => ({ ...acc, [item.method]: item }), {})
    };
  }, []);

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          (payment.id?.toString() || '').includes(searchLower) ||
          (payment.invoiceNumber || '').toLowerCase().includes(searchLower) ||
          (payment.patient?.full_name || '').toLowerCase().includes(searchLower) ||
          (payment.transaction_ref || '').toLowerCase().includes(searchLower) ||
          (payment.notes || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && payment.status !== filters.status) {
        return false;
      }

      // Method filter
      if (filters.method !== "all" && payment.method !== filters.method) {
        return false;
      }

      return true;
    });
  }, [payments, filters]);

  // Handle payment actions
  const handlePaymentUpdate = async (paymentId: number, status: PaymentStatus) => {
    try {
      await api.payments.updatePaymentStatus(paymentId, { status });
      
      // Update local payment
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status } : p
      ));

      // Recalculate stats
      const updatedPayments = payments.map(p => 
        p.id === paymentId ? { ...p, status } : p
      );
      const stats = calculatePaymentStats(updatedPayments);
      setPaymentStats(stats);
      
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handlePaymentDelete = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      await api.payments.deletePayment(paymentId);
      
      // Update local payments
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      
      // Recalculate stats
      const stats = calculatePaymentStats(payments.filter(p => p.id !== paymentId));
      setPaymentStats(stats);
      
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handlePaymentRetry = async (paymentId: number) => {
    try {
      await api.payments.retryPayment(paymentId);
      
      // Update local payment
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'pending' } : p
      ));

      // Recalculate stats
      const updatedPayments = payments.map(p => 
        p.id === paymentId ? { ...p, status: 'pending' } : p
      );
      const stats = calculatePaymentStats(updatedPayments);
      setPaymentStats(stats);
      
    } catch (error) {
      console.error('Error retrying payment:', error);
    }
  };

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayments(prev => 
      prev.includes(payment.id) 
        ? prev.filter(id => id !== payment.id)
        : [...prev, payment.id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPayments(filteredPayments.map(p => p.id));
  };

  const handleClearSelection = () => {
    setSelectedPayments([]);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPayments.length === 0) return;

    try {
      switch (action) {
        case 'update-status':
          // This would open a modal to select new status
          console.log('Bulk status update not implemented yet');
          break;
        case 'delete':
          if (!confirm(`Delete ${selectedPayments.length} selected payments?`)) {
            return;
          }
          
          for (const paymentId of selectedPayments) {
            await api.payments.deletePayment(paymentId);
          }
          
          setPayments(prev => prev.filter(p => !selectedPayments.includes(p.id)));
          setSelectedPayments([]);
          
          // Recalculate stats
          const stats = calculatePaymentStats(payments.filter(p => !selectedPayments.includes(p.id)));
          setPaymentStats(stats);
          break;
        case 'retry':
          for (const paymentId of selectedPayments) {
            await api.payments.retryPayment(paymentId);
          }
          
          setPayments(prev => prev.map(p => 
            selectedPayments.includes(p.id) ? { ...p, status: 'pending' } : p
          ));
          setSelectedPayments([]);
          
          // Recalculate stats
          const updatedPayments = payments.map(p => 
            selectedPayments.includes(p.id) ? { ...p, status: 'pending' } : p
          );
          const stats = calculatePaymentStats(updatedPayments);
          setPaymentStats(stats);
          break;
        default:
          console.log('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      completed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      refunded: 'text-blue-600 bg-blue-50'
    };
    return colors[status as keyof typeof colors] || 'text-neutral-600 bg-neutral-50';
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      mobile_money: '📱',
      insurance: '🏥',
      bank_transfer: '🏦'
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      {paymentStats && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Payment Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{paymentStats.totalPayments}</div>
              <div className="text-sm text-blue-700">Total Payments</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(paymentStats.totalRevenue)}</div>
              <div className="text-sm text-green-700">Total Revenue</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(paymentStats.averagePayment)}</div>
              <div className="text-sm text-purple-700">Average Payment</div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{paymentStats.pendingPayments}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-2">{paymentStats.failedPayments}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {Object.entries(paymentStats.methodBreakdown).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMethodIcon(method)}</span>
                    <div>
                      <div className="font-medium text-neutral-900 capitalize">{method.replace('_', ' ')}</div>
                      <div className="text-sm text-neutral-600">
                        {data.count} payments • {formatCurrency(data.total)} ({data.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="w-16 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search payments..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Method</label>
            <select
              value={filters.method}
              onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="insurance">Insurance</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPayments.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-primary-700 font-medium">
              {selectedPayments.length} payment{selectedPayments.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('update-status')}
                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
              >
                Update Status
              </button>
              <button
                onClick={() => handleBulkAction('retry')}
                className="px-3 py-1 bg-warning-600 hover:bg-warning-700 text-white text-sm font-medium rounded-lg"
              >
                Retry Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
              >
                Delete Selected
              </button>
              <button
                onClick={handleClearSelection}
                className="px-3 py-1 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-sm font-medium rounded-lg"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Payment Transactions</h2>
          <div className="flex gap-2">
            <span className="text-sm text-neutral-600">
              {filteredPayments.length} of {payments.length} payments
            </span>
            <button
              onClick={handleSelectAll}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Select All
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-neutral-600">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No payments found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === filteredPayments.length}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Invoice
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {payment.patient?.full_name || 'Unknown Patient'}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {payment.invoiceNumber || `INV-${payment.invoice_id}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">
                      {formatCurrency(payment.amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {getMethodIcon(payment.method)}
                      <span className="ml-2 capitalize">{payment.method?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date(payment.processed_at || payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handlePaymentRetry(payment.id)}
                            className="text-warning-600 hover:text-warning-700 text-sm font-medium"
                          >
                            Retry
                          </button>
                        )}
                        {payment.status === 'failed' && (
                          <button
                            onClick={() => handlePaymentRetry(payment.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handlePaymentDelete(payment.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
