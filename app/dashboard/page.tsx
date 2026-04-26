/**
 * Dashboard Home Page
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Invoices",
      value: "248",
      change: "+12%",
      icon: "📋",
      color: "primary",
    },
    {
      title: "Total Revenue",
      value: "KES 2.4M",
      change: "+8%",
      icon: "💰",
      color: "success",
    },
    {
      title: "Pending Payments",
      value: "32",
      change: "-5%",
      icon: "⏳",
      color: "warning",
    },
    {
      title: "Active Patients",
      value: "156",
      change: "+20%",
      icon: "👥",
      color: "info",
    },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary-50 border-primary-200";
      case "success":
        return "bg-success-50 border-success-200";
      case "warning":
        return "bg-warning-50 border-warning-200";
      case "info":
        return "bg-info-50 border-info-200";
      default:
        return "bg-neutral-50 border-neutral-200";
    }
  };

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome, {user?.name}! 👋
        </h2>
        <p className="text-neutral-600">
          Here's what's happening in your healthcare billing system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${getColorClass(stat.color)} border rounded-lg p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-neutral-600 text-sm font-medium">
                {stat.title}
              </p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-2">
              {stat.value}
            </p>
            <p className="text-xs text-success-600 font-semibold">
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-3">
            {[
              {
                id: "INV-001",
                patient: "John Doe",
                amount: "KES 5,000",
                status: "paid",
              },
              {
                id: "INV-002",
                patient: "Jane Smith",
                amount: "KES 3,500",
                status: "pending",
              },
              {
                id: "INV-003",
                patient: "Mike Johnson",
                amount: "KES 7,200",
                status: "partially_paid",
              },
            ].map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0"
              >
                <div>
                  <p className="font-semibold text-neutral-900">
                    {invoice.id}
                  </p>
                  <p className="text-sm text-neutral-600">{invoice.patient}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    {invoice.amount}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === "paid"
                        ? "bg-success-50 text-success-700"
                        : invoice.status === "pending"
                          ? "bg-error-50 text-error-700"
                          : "bg-warning-50 text-warning-700"
                    }`}
                  >
                    {invoice.status === "paid"
                      ? "Paid"
                      : invoice.status === "pending"
                        ? "Pending"
                        : "Partially Paid"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-center">
              + New Invoice
            </button>
            <button className="w-full py-3 px-4 border-2 border-primary-600 text-primary-600 hover:text-primary-700 hover:border-primary-700 font-semibold rounded-lg transition-colors">
              Record Payment
            </button>
            <button className="w-full py-3 px-4 border-2 border-neutral-200 text-neutral-900 hover:border-neutral-300 font-semibold rounded-lg transition-colors">
              Add Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
