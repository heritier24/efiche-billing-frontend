/**
 * Dashboard Home Page
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { AddPatientModal, NewInvoiceModal, RecordPaymentModal } from "@/components/dashboard/modals";
import { getDashboardStats, getInsurances } from "@/lib/api/mock";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Modal states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  // Dynamic data states
  const [patients, setPatients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch dashboard statistics
        const stats = await getDashboardStats();
        setDashboardStats(stats);

        // Fetch insurances for modals
        const insuranceData = await getInsurances();
        setInsurances(insuranceData);

        // TODO: Fetch patients and invoices when APIs are available
        // const patientsData = await getPatients();
        // setPatients(patientsData);
        
        // const invoicesData = await getRecentInvoices();
        // setInvoices(invoicesData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Modal handlers
  const handleAddPatient = async (patientData: any) => {
    console.log("Adding patient:", patientData);
    // TODO: API call to add patient
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    console.log("Creating invoice:", invoiceData);
    // TODO: API call to create invoice
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleRecordPayment = async (paymentData: any) => {
    console.log("Recording payment:", paymentData);
    // TODO: API call to record payment
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Dynamic stats based on API data
  const stats = dashboardStats ? [
    {
      title: "Total Invoices",
      value: dashboardStats.total_invoices?.toString() || "0",
      change: "+12%",
      icon: "📋",
      color: "primary",
    },
    {
      title: "Total Revenue",
      value: `RWF ${(dashboardStats.total_revenue / 1000000).toFixed(1)}M`,
      change: "+8%",
      icon: "💰",
      color: "success",
    },
    {
      title: "Pending Payments",
      value: dashboardStats.pending_invoices?.toString() || "0",
      change: "-5%",
      icon: "⏳",
      color: "warning",
    },
    {
      title: "Active Patients",
      value: "156", // TODO: Add to API when available
      change: "+20%",
      icon: "👥",
      color: "info",
    },
  ] : [
    // Loading placeholder stats
    {
      title: "Total Invoices",
      value: "...",
      change: "Loading",
      icon: "📋",
      color: "primary",
    },
    {
      title: "Total Revenue",
      value: "...",
      change: "Loading",
      icon: "💰",
      color: "success",
    },
    {
      title: "Pending Payments",
      value: "...",
      change: "Loading",
      icon: "⏳",
      color: "warning",
    },
    {
      title: "Active Patients",
      value: "...",
      change: "Loading",
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
            {invoices.length > 0 ? invoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0"
              >
                <div>
                  <p className="font-semibold text-neutral-900">
                    {invoice.id}
                  </p>
                  <p className="text-sm text-neutral-600">{invoice.patientName || 'Unknown Patient'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    RWF {invoice.totalAmount?.toLocaleString() || '0'}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === "paid"
                      ? "bg-success-100 text-success-700"
                      : invoice.status === "pending"
                        ? "bg-warning-100 text-warning-700"
                        : "bg-info-100 text-info-700"
                  }`}>
                    {invoice.status === "paid"
                      ? "Paid"
                      : invoice.status === "pending"
                        ? "Pending"
                        : "Partially Paid"}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No recent invoices found</p>
                <p className="text-sm mt-2">Invoices will appear here once they are created</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              + New Invoice
            </button>
            <button 
              onClick={() => setShowRecordPaymentModal(true)}
              className="w-full py-3 px-4 border-2 border-primary-600 text-primary-600 hover:text-primary-700 hover:border-primary-700 font-semibold rounded-lg transition-colors"
            >
              Record Payment
            </button>
            <button 
              onClick={() => setShowAddPatientModal(true)}
              className="w-full py-3 px-4 border-2 border-neutral-200 text-neutral-900 hover:border-neutral-300 font-semibold rounded-lg transition-colors"
            >
              Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSubmit={handleAddPatient}
      />

      <NewInvoiceModal
        isOpen={showNewInvoiceModal}
        onClose={() => setShowNewInvoiceModal(false)}
        onSubmit={handleCreateInvoice}
        patients={patients}
      />

      <RecordPaymentModal
        isOpen={showRecordPaymentModal}
        onClose={() => setShowRecordPaymentModal(false)}
        onSubmit={handleRecordPayment}
        invoices={invoices}
        insurances={insurances}
      />
    </div>
  );
}
