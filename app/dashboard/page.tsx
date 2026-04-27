/**
 * Dashboard Home Page
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { AddPatientModal, NewInvoiceModal } from "@/components/dashboard/modals";
import DashboardRecordPaymentModal from "@/components/dashboard/modals/DashboardRecordPaymentModal";
import { api } from "@/lib/api/backend";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Modal states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  // Format revenue numbers for better display
const formatRevenue = (revenue: number): string => {
  if (revenue >= 1000000) {
    return `RWF ${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `RWF ${(revenue / 1000).toFixed(1)}K`;
  } else {
    return `RWF ${revenue.toLocaleString()}`;
  }
};

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
        
        // Fetch main dashboard statistics
        try {
          const stats = await api.dashboard.getStats();
          console.log('Dashboard stats from API:', stats);
          setDashboardStats(stats);
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          
          // Fallback: Calculate revenue from payments if dashboard stats fail
          try {
            const paymentsResponse = await api.payments.getAllPayments({ limit: 1000 });
            const completedPayments = paymentsResponse.data?.filter((p: any) => 
              p.status === 'completed' || p.status === 'confirmed'
            ) || [];
            const calculatedRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
            
            console.log('Calculated revenue from payments:', calculatedRevenue);
            
            setDashboardStats({
              total_invoices: paymentsResponse.data?.length || 0,
              total_revenue: calculatedRevenue,
              pending_invoices: paymentsResponse.data?.filter((p: any) => p.status === 'pending').length || 0,
              active_patients: 0, // Will be fetched separately
              monthly_stats: {
                current_month: { invoices: 0, revenue: calculatedRevenue, patients: 0 },
                previous_month: { invoices: 0, revenue: 0, patients: 0 }
              },
              payment_methods_breakdown: {
                cash: completedPayments.filter((p: any) => p.method === 'cash').length,
                mobile_money: completedPayments.filter((p: any) => p.method === 'mobile_money').length,
                insurance: completedPayments.filter((p: any) => p.method === 'insurance').length
              }
            });
          } catch (paymentsError) {
            console.error('Error fetching payments for fallback:', paymentsError);
            // Set fallback values
            setDashboardStats({
              total_invoices: 0,
              total_revenue: 0,
              pending_invoices: 0,
              active_patients: 0,
              monthly_stats: {
                current_month: { invoices: 0, revenue: 0, patients: 0 },
                previous_month: { invoices: 0, revenue: 0, patients: 0 }
              },
              payment_methods_breakdown: {
                cash: 0,
                mobile_money: 0,
                insurance: 0
              }
            });
          }
        }

        // Fetch insurances for modals
        try {
          const insuranceResponse = await api.facilities.getInsurances(1); // Default facility ID
          setInsurances(insuranceResponse.data || []);
        } catch (error) {
          console.error('Error fetching insurances:', error);
          setInsurances([]);
        }

        // Fetch recent invoices using dedicated dashboard endpoint
        try {
          const recentInvoicesResponse = await api.dashboard.getRecentInvoices({ limit: 5 });
          
          // Debug: Log the actual backend response structure
          console.log('Recent invoices response:', recentInvoicesResponse);
          if (recentInvoicesResponse.data && recentInvoicesResponse.data.length > 0) {
            console.log('Sample invoice structure:', recentInvoicesResponse.data[0]);
          }
          
          const transformedInvoices = (recentInvoicesResponse.data || []).map((invoice: any) => {
            // Try different field names for patient name, using any type to handle backend response variations
            const patientName = 
              invoice.patient_name || 
              invoice.patient?.full_name || 
              invoice.visit?.patient?.full_name || 
              `Patient ${invoice.id}` ||
              'Unknown Patient';
            
            return {
              id: invoice.id.toString(),
              patientName: patientName,
              totalAmount: invoice.total_amount || 0,
              status: invoice.status,
            };
          });
          setInvoices(transformedInvoices);
        } catch (error) {
          console.error('Error fetching recent invoices:', error);
          setInvoices([]);
        }

        // Fetch patients for modal
        try {
          const patientsResponse = await api.patients.listPatients({ limit: 50 });
          const transformedPatients = (patientsResponse.data || []).map((patient) => ({
            id: patient.id.toString(),
            name: `${patient.first_name} ${patient.last_name}`,
          }));
          setPatients(transformedPatients);
        } catch (error) {
          console.error('Error fetching patients:', error);
          setPatients([]);
        }
        
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
    try {
      console.log("Adding patient:", patientData);
      // Transform frontend data to backend format
      const backendPatientData = {
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        phone: patientData.phone,
        date_of_birth: patientData.date_of_birth,
        gender: patientData.gender,
        address: patientData.address,
        insurance_id: patientData.insurance_id ? parseInt(patientData.insurance_id) : undefined,
      };

      await api.patients.createPatient(backendPatientData);
      
      // Refresh patients list
      const patientsResponse = await api.patients.listPatients({ limit: 50 });
      const transformedPatients = (patientsResponse.data || []).map((patient) => ({
        id: patient.id.toString(),
        name: `${patient.first_name} ${patient.last_name}`,
      }));
      setPatients(transformedPatients);
      
      setShowAddPatientModal(false);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      console.log("Creating invoice:", invoiceData);
      // Transform frontend data to backend format
      const backendInvoiceData = {
        visit_id: parseInt(invoiceData.visitId),
        line_items: invoiceData.lineItems.map((item: any) => ({
          item_code: item.name.replace(/\s+/g, '_').toUpperCase(),
          description: item.description || item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice
        })),
        insurance_id: invoiceData.insuranceId ? parseInt(invoiceData.insuranceId) : undefined,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      await api.invoices.createInvoice(backendInvoiceData);
      
      // Refresh invoices list
      const invoicesResponse = await api.invoices.listInvoices({ limit: 5 });
      const transformedInvoices = (invoicesResponse.data || []).map((invoice: any) => ({
        id: invoice.id.toString(),
        patientName: 
          invoice.patient_name || 
          invoice.patient?.full_name || 
          invoice.visit?.patient?.full_name || 
          `Patient ${invoice.id}` ||
          'Unknown Patient',
        totalAmount: invoice.total_amount || 0,
        status: invoice.status,
      }));
      setInvoices(transformedInvoices);
      
      setShowNewInvoiceModal(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
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
      value: formatRevenue(dashboardStats.total_revenue || 0),
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
      value: patients.length?.toString() || "0",
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

      <DashboardRecordPaymentModal
        isOpen={showRecordPaymentModal}
        onClose={() => setShowRecordPaymentModal(false)}
        onSuccess={() => {
          // Refresh dashboard data after successful payment
          window.location.reload();
        }}
      />
    </div>
  );
}
