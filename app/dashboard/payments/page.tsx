/**
 * Dashboard Payments Page
 * Comprehensive payment management with history, reconciliation, and analytics
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api/backend";
import DashboardRecordPaymentModal from "@/components/dashboard/modals/DashboardRecordPaymentModal";

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  method: "cash" | "mobile_money" | "insurance";
  insuranceName?: string;
  phoneNumber?: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  confirmationCode?: string;
  processedBy: string;
  notes?: string;
  // Enhanced fields from backend
  patient?: {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: string;
  };
}

export default function DashboardPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentStats, setPaymentStats] = useState<any>(null);

  // Handle payment success
  const handlePaymentSuccess = (payment: any) => {
    console.log('Payment recorded:', payment);
    // Refresh payments list
    const fetchPayments = async () => {
      try {
        const response = await api.payments.getAllPayments({
          search: searchTerm || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page: currentPage,
          limit: 20
        });
        
        const transformedPayments = (response.data || []).map((payment) => ({
          id: payment.id.toString(),
          invoiceId: payment.invoice_id?.toString() || '',
          invoiceNumber: `INV-${payment.invoice_id}`,
          patientName: 'Unknown Patient', 
          amount: payment.amount || 0,
          method: payment.method as "cash" | "mobile_money" | "insurance",
          phoneNumber: payment.phone || '',
          status: (payment.status === 'confirmed' ? 'completed' : payment.status) as "pending" | "completed" | "failed",
          timestamp: payment.created_at || '',
          confirmationCode: payment.transaction_ref,
          processedBy: payment.cashier_id?.toString() || 'Unknown',
          notes: payment.notes
        }));
        
        setPayments(transformedPayments);
        setTotalCount(response.total || transformedPayments.length);
      } catch (error) {
        console.error('Error refreshing payments:', error);
      }
    };
    fetchPayments();
    setIsRecordPaymentModalOpen(false);
  };

  // Fetch payments on component mount and when filters change
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        
        // Use real API call
        const response = await api.payments.getAllPayments({
          search: searchTerm || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page: currentPage,
          limit: 20
        });
        
        // Transform backend data to frontend format using enhanced response
        const transformedPayments = (response.data || []).map((payment: any) => ({
          id: payment.id.toString(),
          invoiceId: payment.invoice_id?.toString() || '',
          invoiceNumber: payment.invoice?.invoice_number || `INV-${payment.invoice_id}`,
          patientName: payment.patient?.full_name || 'Unknown Patient',
          amount: payment.amount || 0,
          method: payment.method as "cash" | "mobile_money" | "insurance",
          phoneNumber: payment.phone || '',
          status: (payment.status === 'confirmed' ? 'completed' : payment.status) as "pending" | "completed" | "failed",
          timestamp: payment.created_at || '',
          confirmationCode: payment.transaction_ref,
          processedBy: payment.cashier_id?.toString() || 'Unknown',
          notes: payment.notes,
          // Include enhanced data for future use
          patient: payment.patient,
          invoice: payment.invoice
        }));
        
        setPayments(transformedPayments);
        setTotalCount(response.total || transformedPayments.length);
        
        // Fetch payment statistics
        try {
          const statsResponse = await api.payments.getPaymentSummary();
          setPaymentStats(statsResponse);
        } catch (statsError) {
          console.error('Error fetching payment stats:', statsError);
          // Set fallback stats based on current payments
          const completed = transformedPayments.filter(p => p.status === 'completed');
          const pending = transformedPayments.filter(p => p.status === 'pending');
          setPaymentStats({
            total_payments: transformedPayments.length,
            completed_payments: completed.length,
            total_revenue: completed.reduce((sum, p) => sum + p.amount, 0),
            pending_amount: pending.reduce((sum, p) => sum + p.amount, 0),
            payment_methods_breakdown: {
              cash: transformedPayments.filter(p => p.method === 'cash').length,
              mobile_money: transformedPayments.filter(p => p.method === 'mobile_money').length,
              insurance: transformedPayments.filter(p => p.method === 'insurance').length
            }
          });
        }
        
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
        setTotalCount(0);
        setPaymentStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [searchTerm, statusFilter, methodFilter, dateFilter, currentPage]);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.confirmationCode && payment.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    
    const matchesDate = dateFilter === "all" || 
                        (dateFilter === "today" && isToday(payment.timestamp)) ||
                        (dateFilter === "week" && isWithinWeek(payment.timestamp)) ||
                        (dateFilter === "month" && isWithinMonth(payment.timestamp));
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  // Pagination (will be replaced by server-side pagination)
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isToday = (timestamp: string) => {
    const paymentDate = new Date(timestamp);
    const today = new Date();
    return paymentDate.toDateString() === today.toDateString();
  };

  const isWithinWeek = (timestamp: string) => {
    const paymentDate = new Date(timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return paymentDate >= weekAgo;
  };

  const isWithinMonth = (timestamp: string) => {
    const paymentDate = new Date(timestamp);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return paymentDate >= monthAgo;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-50 text-success-700 border border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border border-warning-200";
      case "failed":
        return "bg-error-50 text-error-700 border border-error-200";
      default:
        return "bg-neutral-50 text-neutral-700 border border-neutral-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-neutral-100 text-neutral-700";
      case "mobile_money":
        return "bg-primary-100 text-primary-700";
      case "insurance":
        return "bg-success-100 text-success-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mobile_money":
        return "Mobile Money";
      case "insurance":
        return "Insurance";
      default:
        return method;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(filteredPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on payments:`, selectedPayments);
    // TODO: Implement bulk actions
  };

  const handleExport = () => {
    console.log("Exporting payments...");
    // TODO: Implement export functionality
  };

  const handleReconcile = () => {
    console.log("Reconciling payments...");
    // TODO: Implement reconciliation
  };

  // CRUD Operations with real API calls
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      // Real API call to update payment status
      const response = await api.payments.updatePaymentStatus(parseInt(paymentId), newStatus as 'pending' | 'confirmed' | 'failed');
      
      if (response.success) {
        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === paymentId ? { ...p, status: newStatus as "pending" | "completed" | "failed" } : p
        ));
        
        // Refresh statistics
        try {
          const statsResponse = await api.payments.getPaymentSummary();
          setPaymentStats(statsResponse);
        } catch (statsError) {
          console.error('Error refreshing stats:', statsError);
        }
      } else {
        throw new Error(response.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Real API call to delete payment
      const response = await api.payments.deletePayment(parseInt(paymentId));
      
      if (response.success) {
        // Update local state
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        setSelectedPayments(prev => prev.filter(id => id !== paymentId));
        
        // Refresh statistics
        try {
          const statsResponse = await api.payments.getPaymentSummary();
          setPaymentStats(statsResponse);
        } catch (statsError) {
          console.error('Error refreshing stats:', statsError);
        }
      } else {
        throw new Error(response.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleRetryPayment = async (paymentId: string) => {
    try {
      // Real API call to retry payment
      const response = await api.payments.retryPayment(parseInt(paymentId));
      
      if (response.success) {
        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === paymentId ? { ...p, status: 'pending' } : p
        ));
        
        // Refresh statistics
        try {
          const statsResponse = await api.payments.getPaymentSummary();
          setPaymentStats(statsResponse);
        } catch (statsError) {
          console.error('Error refreshing stats:', statsError);
        }
      } else {
        throw new Error(response.message || 'Failed to retry payment');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Failed to retry payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Calculate statistics from API data or fallback to local calculation
  const totalPayments = paymentStats?.total_payments || payments.length;
  const completedPayments = paymentStats?.completed_payments || payments.filter(p => p.status === "completed").length;
  const totalRevenue = paymentStats?.total_revenue || payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = paymentStats?.pending_amount || payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Payments</h1>
            <p className="text-neutral-600 mt-1">Manage payment transactions and reconciliation</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleReconcile}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              🔄 Reconcile
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              📥 Export
            </button>
            <button
              onClick={() => setIsRecordPaymentModalOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              + Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Payments</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{totalPayments}</p>
            </div>
            <div className="text-3xl">💳</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completed</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{completedPayments}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">RWF {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">RWF {pendingAmount.toLocaleString()}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by patient, invoice ID, or confirmation code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setMethodFilter("all");
                setDateFilter("all");
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPayments.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-primary-700 font-medium">
              {selectedPayments.length} payment{selectedPayments.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Export Selected
              </button>
              <button
                onClick={() => handleBulkAction("reconcile")}
                className="px-3 py-1 border border-primary-600 text-primary-600 hover:bg-primary-50 text-sm font-medium rounded-lg transition-colors"
              >
                Reconcile Selected
              </button>
              <button
                onClick={() => setSelectedPayments([])}
                className="px-3 py-1 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-sm font-medium rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-neutral-600 mt-4">Loading payments...</p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No payments found</h3>
              <p className="text-neutral-600 mb-6">Payment records will appear here once they are processed</p>
              <button
                onClick={() => setIsRecordPaymentModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                + Record Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === paginatedPayments.length && paginatedPayments.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Processed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">{payment.id}</p>
                      {payment.confirmationCode && (
                        <p className="text-sm font-medium text-neutral-600">Code: {payment.confirmationCode}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/billing/${payment.invoiceId.replace('INV-', '')}`}
                      className="font-bold text-primary-600 hover:text-primary-700 text-sm"
                    >
                      {payment.invoiceNumber || payment.invoiceId}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-neutral-900 text-sm">{payment.patientName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getMethodColor(payment.method)}`}>
                        {getMethodLabel(payment.method)}
                      </span>
                      {payment.method === "mobile_money" && payment.phoneNumber && (
                        <p className="text-sm text-neutral-500 mt-1">{payment.phoneNumber}</p>
                      )}
                      {payment.method === "insurance" && payment.insuranceName && (
                        <p className="text-sm text-neutral-500 mt-1">{payment.insuranceName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-neutral-900 text-sm">
                    RWF {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-neutral-900 text-sm">{formatDate(payment.timestamp)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-neutral-900 text-sm">{payment.processedBy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => console.log("View payment details:", payment.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </button>
                      {payment.status === "pending" && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(payment.id, "completed")}
                          className="text-success-600 hover:text-success-700 font-medium text-sm"
                        >
                          Confirm
                        </button>
                      )}
                      {payment.status === "failed" && (
                        <button
                          onClick={() => handleRetryPayment(payment.id)}
                          className="text-warning-600 hover:text-warning-700 font-medium text-sm"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-error-600 hover:text-error-700 font-medium text-sm"
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

      {/* Record Payment Modal */}
      <DashboardRecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        onSuccess={() => {
          // Refresh payments list after successful payment
          const fetchPayments = async () => {
            try {
              const response = await api.payments.getAllPayments({
                search: searchTerm || undefined,
                status: statusFilter === "all" ? undefined : statusFilter,
                page: currentPage,
                limit: 20
              });
              
              const transformedPayments = (response.data || []).map((payment) => ({
                id: payment.id.toString(),
                invoiceId: payment.invoice_id?.toString() || '',
                invoiceNumber: `INV-${payment.invoice_id}`,
                patientName: 'Unknown Patient', // This will be updated when we fetch invoice details
                amount: payment.amount || 0,
                method: payment.method as "cash" | "mobile_money" | "insurance",
                phoneNumber: payment.phone || '',
                status: (payment.status === 'confirmed' ? 'completed' : payment.status) as "pending" | "completed" | "failed",
                timestamp: payment.created_at || '',
                confirmationCode: payment.transaction_ref,
                processedBy: payment.cashier_id?.toString() || 'Unknown',
                notes: payment.notes
              }));
              
              setPayments(transformedPayments);
              setTotalCount(response.total || transformedPayments.length);
            } catch (error) {
              console.error('Error refreshing payments:', error);
            }
          };
          fetchPayments();
        }}
      />
    </div>
  );
}
