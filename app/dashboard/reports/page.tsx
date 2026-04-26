/**
 * Dashboard Reports Page
 * Comprehensive analytics and reporting with charts, summaries, and exports
 */

"use client";

import { useState, useEffect } from "react";

interface ReportData {
  revenue: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  payments: {
    byMethod: { cash: number; mobile_money: number; insurance: number };
    byStatus: { completed: number; pending: number; failed: number };
  };
  invoices: {
    byStatus: { pending: number; partially_paid: number; paid: number; overdue: number };
    averageAmount: number;
  };
  patients: {
    new: number;
    active: number;
    total: number;
  };
}

export default function DashboardReportsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [reportType, setReportType] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic data states
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch report data on component mount and when date range changes
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Replace with real API call when available
        // const response = await fetch(`/api/reports?date_range=${dateRange}`);
        // const data = await response.json();
        // setReportData(data);
        
        // For now, keep null until backend API is ready
        setReportData(null);
        
      } catch (error) {
        console.error('Error fetching report data:', error);
        setReportData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [dateRange]);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    console.log(`Exporting report as ${format}...`);
    // TODO: Implement export functionality
    setTimeout(() => setIsExporting(false), 2000);
  };

  const getRevenueData = () => {
    if (!reportData) return [];
    
    switch (dateRange) {
      case "week":
        return reportData?.revenue?.weekly || [];
      case "month":
        return reportData?.revenue?.monthly || [];
      default:
        return reportData?.revenue?.daily || [];
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
  const totalPayments = reportData ? Object.values(reportData.payments.byMethod).reduce((sum, val) => sum + val, 0) : 0;
  const totalInvoices = reportData ? Object.values(reportData.invoices.byStatus).reduce((sum, val) => sum + val, 0) : 0;

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
                  <p className="text-2xl font-bold text-info-600 mt-1">{reportData?.patients?.active || 0}</p>
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
                {reportData ? Object.entries(reportData.payments.byMethod).map(([method, amount]) => {
                  const percentage = (amount / totalPayments) * 100;
                  const colors = {
                    cash: "bg-neutral-500",
                    mobile_money: "bg-primary-500",
                    insurance: "bg-success-500"
                  };
                  return (
                    <div key={method}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700 capitalize">
                          {method.replace("_", " ")}
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          RWF {amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`${colors[method as keyof typeof colors]} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                }) : []}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Invoice Status</h3>
              <div className="space-y-4">
                {reportData ? Object.entries(reportData.invoices.byStatus).map(([status, count]) => {
                  const percentage = (count / totalInvoices) * 100;
                  const colors = {
                    pending: "bg-warning-500",
                    partially_paid: "bg-info-500",
                    paid: "bg-success-500",
                    overdue: "bg-error-500"
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-700 capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`${colors[status as keyof typeof colors]} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                }) : []}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {reportType === "revenue" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-neutral-600">Average Daily Revenue</p>
                <p className="text-2xl font-bold text-primary-600">RWF {Math.round(totalRevenue / getRevenueData().length).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-600">Best Day</p>
                <p className="text-2xl font-bold text-success-600">RWF {Math.max(...getRevenueData()).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-600">Growth Rate</p>
                <p className="text-2xl font-bold text-success-600">+12.5%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Breakdown</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {getRevenueData().map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t" style={{ height: `${(value / Math.max(...getRevenueData())) * 100}%` }}></div>
                  <p className="text-xs text-neutral-600 mt-2">{getTimeLabels()[index]}</p>
                  <p className="text-xs font-medium text-neutral-900">RWF {(value / 1000).toFixed(0)}k</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payments Report */}
      {reportType === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Status</h3>
              <div className="space-y-4">
                {reportData ? Object.entries(reportData.payments.byStatus).map(([status, amount]) => {
                  const colors = {
                    completed: "text-success-600 bg-success-50",
                    pending: "text-warning-600 bg-warning-50",
                    failed: "text-error-600 bg-error-50"
                  };
                  return (
                    <div key={status} className="flex justify-between items-center p-3 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
                        {status}
                      </span>
                      <span className="font-bold text-neutral-900">RWF {amount.toLocaleString()}</span>
                    </div>
                  );
                }) : []}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {reportData ? Object.entries(reportData.payments.byMethod).map(([method, amount]) => {
                  const icons = {
                    cash: "💵",
                    mobile_money: "📱",
                    insurance: "🏥"
                  };
                  return (
                    <div key={method} className="flex justify-between items-center p-3 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icons[method as keyof typeof icons]}</span>
                        <span className="font-medium capitalize">{method.replace("_", " ")}</span>
                      </div>
                      <span className="font-bold text-neutral-900">RWF {amount.toLocaleString()}</span>
                    </div>
                  );
                }) : []}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients Report */}
      {reportType === "patients" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Patients</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{reportData?.patients?.total || 0}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Active Patients</p>
                  <p className="text-2xl font-bold text-success-600 mt-1">{reportData?.patients?.active || 0}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">New Patients</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">{reportData?.patients?.new || 0}</p>
                </div>
                <div className="text-3xl">🆕</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Patient Metrics</h3>
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
