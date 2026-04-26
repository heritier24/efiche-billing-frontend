/**
 * Dashboard Invoices Page
 * Comprehensive invoice management with search, filters, and actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  patientName: string;
  visitId: string;
  invoiceDate: string;
  dueDate: string;
  status: "pending" | "partially_paid" | "paid" | "overdue";
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  lineItemsCount: number;
  lastPaymentDate?: string;
}

export default function DashboardInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Mock data (replace with real API call)
  const invoices: Invoice[] = [
    {
      id: "INV-001",
      patientName: "John Doe",
      visitId: "V001",
      invoiceDate: "2024-04-20",
      dueDate: "2024-04-27",
      status: "pending",
      totalAmount: 50000,
      amountPaid: 0,
      remainingBalance: 50000,
      lineItemsCount: 3,
    },
    {
      id: "INV-002",
      patientName: "Jane Smith",
      visitId: "V002",
      invoiceDate: "2024-04-19",
      dueDate: "2024-04-26",
      status: "partially_paid",
      totalAmount: 75000,
      amountPaid: 30000,
      remainingBalance: 45000,
      lineItemsCount: 5,
      lastPaymentDate: "2024-04-22",
    },
    {
      id: "INV-003",
      patientName: "Mike Johnson",
      visitId: "V003",
      invoiceDate: "2024-04-18",
      dueDate: "2024-04-25",
      status: "paid",
      totalAmount: 35000,
      amountPaid: 35000,
      remainingBalance: 0,
      lineItemsCount: 2,
      lastPaymentDate: "2024-04-21",
    },
    {
      id: "INV-004",
      patientName: "Sarah Williams",
      visitId: "V004",
      invoiceDate: "2024-04-15",
      dueDate: "2024-04-22",
      status: "overdue",
      totalAmount: 60000,
      amountPaid: 0,
      remainingBalance: 60000,
      lineItemsCount: 4,
    },
    {
      id: "INV-005",
      patientName: "David Brown",
      visitId: "V005",
      invoiceDate: "2024-04-17",
      dueDate: "2024-04-24",
      status: "pending",
      totalAmount: 45000,
      amountPaid: 0,
      remainingBalance: 45000,
      lineItemsCount: 3,
    },
  ];

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.visitId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || 
                        (dateFilter === "today" && invoice.invoiceDate === new Date().toISOString().split('T')[0]) ||
                        (dateFilter === "week" && isWithinWeek(invoice.invoiceDate)) ||
                        (dateFilter === "month" && isWithinMonth(invoice.invoiceDate));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const isWithinWeek = (date: string) => {
    const invoiceDate = new Date(date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return invoiceDate >= weekAgo;
  };

  const isWithinMonth = (date: string) => {
    const invoiceDate = new Date(date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return invoiceDate >= monthAgo;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-50 text-success-700 border border-success-200";
      case "partially_paid":
        return "bg-warning-50 text-warning-700 border border-warning-200";
      case "pending":
        return "bg-info-50 text-info-700 border border-info-200";
      case "overdue":
        return "bg-error-50 text-error-700 border border-error-200";
      default:
        return "bg-neutral-50 text-neutral-700 border border-neutral-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "partially_paid":
        return "Partially Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on invoices:`, selectedInvoices);
    // TODO: Implement bulk actions
  };

  const handleExport = () => {
    console.log("Exporting invoices...");
    // TODO: Implement export functionality
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const pendingAmount = invoices.filter(inv => inv.status === "pending" || inv.status === "overdue")
                              .reduce((sum, inv) => sum + inv.remainingBalance, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Invoices</h1>
            <p className="text-neutral-600 mt-1">Manage patient invoices and payment status</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              📥 Export
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              + New Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Invoices</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{invoices.length}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-success-600 mt-1">RWF {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending Amount</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">RWF {pendingAmount.toLocaleString()}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Overdue</p>
              <p className="text-2xl font-bold text-error-600 mt-1">{invoices.filter(inv => inv.status === "overdue").length}</p>
            </div>
            <div className="text-3xl">🚨</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by patient, invoice ID, or visit ID..."
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
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
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
      {selectedInvoices.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-primary-700 font-medium">
              {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("send_reminder")}
                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send Reminder
              </button>
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 border border-primary-600 text-primary-600 hover:bg-primary-50 text-sm font-medium rounded-lg transition-colors"
              >
                Export Selected
              </button>
              <button
                onClick={() => setSelectedInvoices([])}
                className="px-3 py-1 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-sm font-medium rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Visit ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/billing/${invoice.visitId}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {invoice.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{invoice.patientName}</p>
                      <p className="text-sm text-neutral-500">{invoice.lineItemsCount} items</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{invoice.visitId}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-neutral-900">{invoice.invoiceDate}</p>
                      <p className="text-sm text-neutral-500">Due: {invoice.dueDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">
                    RWF {invoice.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-600">
                    RWF {invoice.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={invoice.remainingBalance > 0 ? "text-warning-600" : "text-success-600"}>
                      RWF {invoice.remainingBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/billing/${invoice.visitId}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </Link>
                      {invoice.remainingBalance > 0 && (
                        <Link
                          href={`/billing/${invoice.visitId}`}
                          className="text-success-600 hover:text-success-700 font-medium text-sm"
                        >
                          Pay
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
