/**
 * Dashboard Patients Page
 * Comprehensive patient management with demographics, visit history, and billing
 */

"use client";

import { useState } from "react";
import Link from "next/link";

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

  // Mock data (replace with real API call)
  const patients: Patient[] = [
    {
      id: "P001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+250 788 123 456",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "Kigali, Kicukiro, KG 123 Ave",
      insuranceId: "ins-1",
      insuranceName: "RSSB",
      registrationDate: "2024-01-15",
      lastVisitDate: "2024-04-20",
      totalVisits: 5,
      totalBilled: 250000,
      totalPaid: 200000,
      outstandingBalance: 50000,
      status: "active",
    },
    {
      id: "P002",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+250 733 987 654",
      dateOfBirth: "1992-03-22",
      gender: "female",
      address: "Kigali, Nyarugenge, KN 456 St",
      insuranceId: "ins-2",
      insuranceName: "MMI",
      registrationDate: "2024-02-10",
      lastVisitDate: "2024-04-19",
      totalVisits: 3,
      totalBilled: 150000,
      totalPaid: 120000,
      outstandingBalance: 30000,
      status: "active",
    },
    {
      id: "P003",
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "+250 722 345 678",
      dateOfBirth: "1978-11-08",
      gender: "male",
      address: "Kigali, Gasabo, KG 789 Rd",
      registrationDate: "2023-12-01",
      lastVisitDate: "2024-04-18",
      totalVisits: 8,
      totalBilled: 400000,
      totalPaid: 400000,
      outstandingBalance: 0,
      status: "active",
    },
    {
      id: "P004",
      name: "Sarah Williams",
      email: "sarah.w@email.com",
      phone: "+250 739 234 567",
      dateOfBirth: "1995-07-30",
      gender: "female",
      address: "Kigali, Remera, KG 321 St",
      insuranceId: "ins-3",
      insuranceName: "MediCare Rwanda",
      registrationDate: "2024-03-05",
      lastVisitDate: "2024-04-15",
      totalVisits: 2,
      totalBilled: 100000,
      totalPaid: 40000,
      outstandingBalance: 60000,
      status: "active",
    },
    {
      id: "P005",
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+250 785 678 901",
      dateOfBirth: "1980-09-12",
      gender: "male",
      address: "Kigali, Nyabugogo, KG 654 Ave",
      registrationDate: "2023-10-20",
      lastVisitDate: "2024-03-28",
      totalVisits: 6,
      totalBilled: 300000,
      totalPaid: 280000,
      outstandingBalance: 20000,
      status: "inactive",
    },
  ];

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

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

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              onClick={() => console.log("Add patient modal")}
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
                      <button
                        onClick={() => console.log("View patient details:", patient.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => console.log("Edit patient:", patient.id)}
                        className="text-neutral-600 hover:text-neutral-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      {patient.outstandingBalance > 0 && (
                        <button
                          onClick={() => console.log("Record payment:", patient.id)}
                          className="text-success-600 hover:text-success-700 font-medium text-sm"
                        >
                          Pay
                        </button>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} results
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
