/**
 * Dashboard Reports Page
 * Comprehensive analytics and reporting with charts, summaries, and exports
 */

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/backend";

interface ReportSummary {
  totalRevenue: number;
  totalInvoices: number;
  totalPayments: number;
  averagePaymentAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export default function ReportsPage() {
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      // Fetch real summary data from backend
      const summaryResponse = await api.payments.getPaymentSummary({
        date_from: dateRange.from,
        date_to: dateRange.to
      });

      // Fetch real payment data for breakdown
      const paymentsResponse = await api.payments.getAllPayments({
        limit: 1000,
        date_from: dateRange.from,
        date_to: dateRange.to
      });

      // Calculate payment method breakdown
      const methodCounts = paymentsResponse.data?.reduce((acc: any, payment) => {
        const method = payment.method || 'unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count += 1;
        acc[method].total += payment.amount || 0;
        return acc;
      }, {});

      const breakdown: PaymentMethodBreakdown[] = Object.entries(methodCounts).map(([method, data]: [string, any]) => ({
        method: method.charAt(0).toUpperCase() + method.slice(1),
        count: data.count,
        total: data.total,
        percentage: ((data.total / (summaryResponse.data?.total_revenue || 1)) * 100).toFixed(1)
      }));

      setPaymentBreakdown(breakdown);

      // Set report summary with real data
      setReportSummary({
        totalRevenue: summaryResponse.data?.total_revenue || 0,
        totalInvoices: summaryResponse.data?.total_invoices || 0,
        totalPayments: summaryResponse.data?.total_payments || 0,
        averagePaymentAmount: summaryResponse.data?.average_payment_amount || 0,
        pendingInvoices: summaryResponse.data?.pending_invoices || 0,
        overdueInvoices: summaryResponse.data?.overdue_invoices || 0
      });

    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    console.log(`Exporting report as ${format}...`);
    // TODO: Implement export functionality
    setTimeout(() => setIsExporting(false), 2000);
  };

  const getRevenueData = () => {
    if (!reportSummary) return [];
    
    switch (dateRange) {
      case "week":
        return [85000, 92000, 78000, 105000]; // Sample weekly data
      case "month":
        return [250000, 275000, 320000, 285000]; // Sample monthly data
      default:
        return [85000, 92000, 78000, 105000, 92000, 88000, 95000]; // Sample daily data
    }
  };

  const getTimeLabels = () => {
    switch (dateRange) {
      case "week":
        return ["Week 1", "Week 2", "Week 3", "Week 4"];
      case "month":
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      default:
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }
  };

  const totalRevenue = getRevenueData().reduce((sum, val) => sum + val, 0);
  const totalPayments = paymentBreakdown.reduce((sum, item) => sum + item.total, 0);
  const totalInvoices = reportSummary ? reportSummary.totalInvoices : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Reports</h1>
            <p className="text-neutral-600 mt-1">Analytics and insights for your healthcare billing</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "📄 Export PDF"}
            </button>
            <button
              onClick={() => handleExport("excel")}
              disabled={isExporting}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "📊 Export Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Report Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "revenue", label: "Revenue", icon: "💰" },
                { id: "payments", label: "Payments", icon: "💳" },
                { id: "patients", label: "Patients", icon: "👥" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reportType === type.id
                      ? "bg-primary-600 text-white"
                      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">RWF {totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-success-600 mt-2">+12% from last period</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Payments</p>
                  <p className="text-2xl font-bold text-success-600 mt-1">{totalPayments.toLocaleString()}</p>
                  <p className="text-xs text-success-600 mt-2">+8% from last period</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{totalInvoices}</p>
                  <p className="text-xs text-neutral-600 mt-2">+5% from last period</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Active Patients</p>
                  <p className="text-2xl font-bold text-info-600 mt-1">{reportSummary?.totalInvoices || 0}</p>
                  <p className="text-xs text-success-600 mt-2">+15 new this month</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {getRevenueData().map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary-200 rounded-t" style={{ height: `${(value / Math.max(...getRevenueData())) * 100}%` }}>
                    <div className="w-full bg-primary-600 rounded-t" style={{ height: `${(value / Math.max(...getRevenueData())) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">{getTimeLabels()[index]}</p>
                  <p className="text-xs font-medium text-neutral-900">RWF {(value / 1000).toFixed(0)}k</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {paymentBreakdown.map((item) => {
                  const percentage = (item.total / totalPayments) * 100;
                  const colors = {
                    cash: "bg-neutral-500",
                    mobile_money: "bg-primary-500",
                    insurance: "bg-success-500"
                  };
                  return (
                    <div key={item.method}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700 capitalize">
                          {item.method.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          RWF {item.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`${colors[item.method as keyof typeof colors]} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Metrics */}
        <div className="bg-white rounded-lg border neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Patient Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Total Patients</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{reportSummary?.totalInvoices || 0}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Active Patients</p>
                    <p className="text-2xl font-bold text-success-600 mt-1">{reportSummary?.totalPayments || 0}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">New Patients</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">{reportSummary?.averagePaymentAmount || 0}</p>
                </div>
                <div className="text-3xl">🆕</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600 mb-2">Patient Growth Rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-200 rounded-full h-3">
                    <div className="bg-success-500 h-3 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                  <span className="text-sm font-bold text-success-600">+68%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-2">Patient Retention</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-200 rounded-full h-3">
                    <div className="bg-primary-500 h-3 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <span className="text-sm font-bold text-primary-600">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
