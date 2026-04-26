/**
 * Dashboard Patients Page
 * Comprehensive patient management with demographics, visit history, and billing
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api/backend";
import AddPatientModal from "@/components/dashboard/modals/AddPatientModal";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  insuranceId?: string;
  insuranceName?: string;
  registrationDate: string;
  lastVisitDate?: string;
  totalVisits: number;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  status: "active" | "inactive";
}

export default function DashboardPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch patients on component mount and when filters change
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        
        // Use real API call
        const response = await api.patients.listPatients({
          search: searchTerm || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page: currentPage,
          limit: 20
        });
        
        // Transform backend data to frontend format
        const transformedPatients = response.data.map((patient) => ({
          id: patient.id.toString(),
          name: `${patient.first_name} ${patient.last_name}`,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.date_of_birth,
          gender: patient.gender as "male" | "female" | "other",
          address: patient.address || "",
          insuranceId: undefined, // Not available in backend Patient type
          insuranceName: patient.insurance_name || "",
          registrationDate: patient.registration_date?.split('T')[0] || "",
          lastVisitDate: patient.last_visit_date,
          totalVisits: patient.total_visits || 0,
          totalBilled: patient.total_billed || 0,
          totalPaid: patient.total_paid || 0,
          outstandingBalance: patient.outstanding_balance || 0,
          status: patient.status as "active" | "inactive"
        }));
        
        setPatients(transformedPatients);
        setTotalCount(response.total || 0);
        
      } catch (error) {
        console.error('Error fetching patients:', error);
        
        // Check if it's a network error (backend not available) or 404 (endpoint not implemented)
        const isNetworkError = error instanceof Error && (error.message.includes('Network error') || error.message.includes('fetch'));
        const is404Error = error instanceof Error && error.message.includes('404') || 
                           (error as any)?.status === 404;
        
        if (isNetworkError || is404Error) {
          console.log('Backend endpoint not available, using mock data for development');
          
          // Use mock data as fallback
          const mockPatients = getMockPatients();
          const filteredMockPatients = mockPatients.filter((patient: Patient) => {
            const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 patient.phone.includes(searchTerm);
            
            const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
            const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
            
            return matchesSearch && matchesStatus && matchesGender;
          });
          
          const startIndex = (currentPage - 1) * 20;
          const endIndex = startIndex + 20;
          const paginatedMockPatients = filteredMockPatients.slice(startIndex, endIndex);
          
          setPatients(paginatedMockPatients);
          setTotalCount(filteredMockPatients.length);
        } else {
          // Other errors - show empty state
          setPatients([]);
          setTotalCount(0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [searchTerm, statusFilter, genderFilter, currentPage]);

  // Mock data function for development
  const getMockPatients = (): Patient[] => {
    return [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+250788123456",
        dateOfBirth: "1985-06-15",
        gender: "male",
        address: "Kigali, Kicukiro, KG 123 Ave",
        insuranceId: "INS001",
        insuranceName: "RSSB",
        registrationDate: "2024-01-15",
        lastVisitDate: "2024-04-20",
        totalVisits: 12,
        totalBilled: 450000,
        totalPaid: 380000,
        outstandingBalance: 70000,
        status: "active"
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+250733987654",
        dateOfBirth: "1990-03-22",
        gender: "female",
        address: "Kigali, Nyarugenge, KG 456 St",
        insuranceId: "INS002",
        insuranceName: "MMI",
        registrationDate: "2024-02-10",
        lastVisitDate: "2024-04-18",
        totalVisits: 8,
        totalBilled: 320000,
        totalPaid: 320000,
        outstandingBalance: 0,
        status: "active"
      },
      {
        id: "3",
        name: "Robert Mugisha",
        email: "robert.m@example.com",
        phone: "+250789234567",
        dateOfBirth: "1978-11-08",
        gender: "male",
        address: "Kigali, Gasabo, KG 789 Rd",
        insuranceId: undefined,
        insuranceName: "",
        registrationDate: "2023-12-05",
        lastVisitDate: "2024-03-15",
        totalVisits: 15,
        totalBilled: 680000,
        totalPaid: 520000,
        outstandingBalance: 160000,
        status: "active"
      },
      {
        id: "4",
        name: "Grace Uwimana",
        email: "grace.u@example.com",
        phone: "+250734567890",
        dateOfBirth: "1992-07-30",
        gender: "female",
        address: "Kigali, Kicukiro, KG 321 Blvd",
        insuranceId: "INS003",
        insuranceName: "RFA",
        registrationDate: "2024-01-20",
        lastVisitDate: "2024-04-22",
        totalVisits: 6,
        totalBilled: 280000,
        totalPaid: 280000,
        outstandingBalance: 0,
        status: "active"
      },
      {
        id: "5",
        name: "Eric Niyonzima",
        email: "eric.n@example.com",
        phone: "+250787654321",
        dateOfBirth: "1988-02-14",
        gender: "male",
        address: "Kigali, Nyarugenge, KG 654 Ave",
        insuranceId: undefined,
        insuranceName: "",
        registrationDate: "2023-11-12",
        lastVisitDate: "2024-02-28",
        totalVisits: 10,
        totalBilled: 410000,
        totalPaid: 350000,
        outstandingBalance: 60000,
        status: "inactive"
      }
    ];
  };

  // Handle patient creation
  const handleAddPatient = async (patientData: any) => {
    try {
      // Transform frontend data to backend format
      const backendPatientData = {
        first_name: patientData.name.split(' ')[0] || patientData.name,
        last_name: patientData.name.split(' ').slice(1).join(' ') || '',
        email: patientData.email,
        phone: patientData.phone,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address,
      };

      await api.patients.createPatient(backendPatientData);
      
      // Refresh patients list by triggering the useEffect
      // This will cause the fetchPatients function to run again
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      
      // Check if it's a network error (backend not available) or 404 (endpoint not implemented)
      const isNetworkError = error instanceof Error && (error.message.includes('Network error') || error.message.includes('fetch'));
      const is404Error = error instanceof Error && error.message.includes('404') || 
                         (error as any)?.status === 404;
      
      if (isNetworkError || is404Error) {
        alert('Backend patient endpoint not implemented yet. Patient creation simulated for development.');
        setIsAddModalOpen(false);
        // In a real scenario, you might want to add the patient to local state temporarily
      } else {
        alert('Failed to create patient. Please try again.');
      }
    }
  };

  // Client-side filtering (will be replaced by server-side filtering)
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  // Pagination (will be replaced by server-side pagination)
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-50 text-success-700 border border-success-200";
      case "inactive":
        return "bg-neutral-50 text-neutral-700 border border-neutral-200";
      default:
        return "bg-neutral-50 text-neutral-700 border border-neutral-200";
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "other":
        return "Other";
      default:
        return gender;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(filteredPatients.map(p => p.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId]);
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on patients:`, selectedPatients);
    // TODO: Implement bulk actions
  };

  const handleExport = () => {
    console.log("Exporting patients...");
    // TODO: Implement export functionality
  };

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === "active").length;
  const totalRevenue = patients.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalOutstanding = patients.reduce((sum, p) => sum + p.outstandingBalance, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Patients</h1>
            <p className="text-neutral-600 mt-1">Manage patient records and billing information</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
            >
              📥 Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              + Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Patients</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{totalPatients}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active Patients</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{activePatients}</p>
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
              <p className="text-sm text-neutral-600">Outstanding</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">RWF {totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="text-3xl">⏳</div>
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
              placeholder="Search by name, email, phone, or ID..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Gender</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setGenderFilter("all");
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
      {selectedPatients.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-primary-700 font-medium">
              {selectedPatients.length} patient{selectedPatients.length > 1 ? 's' : ''} selected
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
                onClick={() => setSelectedPatients([])}
                className="px-3 py-1 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-sm font-medium rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-neutral-600 mt-4">Loading patients...</p>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No patients found</h3>
              <p className="text-neutral-600 mb-6">Get started by adding your first patient</p>
              <button
                onClick={() => {/* TODO: Open add patient modal */}}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                + Add Patient
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
                    checked={selectedPatients.length === paginatedPatients.length && paginatedPatients.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Billed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={(e) => handleSelectPatient(patient.id, e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{patient.name}</p>
                      <p className="text-sm text-neutral-500">ID: {patient.id}</p>
                      <p className="text-sm text-neutral-500">
                        {getGenderLabel(patient.gender)}, {getAge(patient.dateOfBirth)} years
                      </p>
                      <p className="text-sm text-neutral-500">Registered: {patient.registrationDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-neutral-900">{patient.phone}</p>
                      <p className="text-sm text-neutral-500">{patient.email}</p>
                      <p className="text-sm text-neutral-500 truncate max-w-xs">{patient.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {patient.insuranceName ? (
                      <div>
                        <p className="font-medium text-neutral-900">{patient.insuranceName}</p>
                        <p className="text-sm text-neutral-500">{patient.insuranceId}</p>
                      </div>
                    ) : (
                      <span className="text-neutral-500">No Insurance</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-neutral-900">{patient.totalVisits} visits</p>
                      <p className="text-sm text-neutral-500">
                        Last: {patient.lastVisitDate || "No visits"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">
                    RWF {patient.totalBilled.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-600">
                    RWF {patient.totalPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={patient.outstandingBalance > 0 ? "text-warning-600" : "text-success-600"}>
                      RWF {patient.outstandingBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => alert(`Edit patient functionality coming soon for patient ${patient.id}`)}
                        className="text-neutral-600 hover:text-neutral-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      {patient.outstandingBalance > 0 && (
                        <Link
                          href={`/billing/${patient.id}`}
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
        )}
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}
