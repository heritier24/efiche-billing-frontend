/**
 * Settings Page with User Profile, User Management, and Roles & Permissions
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { userApi } from "@/lib/api/backend";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: string;
}

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    role: "Billing Officer",
  });

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
  });

  // Mock data (replace with real API calls)
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@efiche.com",
      role: "Administrator",
      permissions: ["all"],
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@efiche.com",
      role: "Billing Officer",
      permissions: ["create_invoice", "process_payment", "view_reports"],
      isActive: true,
      createdAt: "2024-02-20",
    },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Administrator",
      description: "Full system access",
      permissions: ["all"],
    },
    {
      id: "2",
      name: "Billing Officer",
      description: "Manage invoices and payments",
      permissions: ["create_invoice", "process_payment", "view_reports"],
    },
    {
      id: "3",
      name: "Receptionist",
      description: "Basic patient and invoice management",
      permissions: ["view_patients", "create_invoice"],
    },
  ]);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+250 788 123 456",
    department: "Billing Department",
  });

  const tabs = [
    { id: "profile", label: "User Profile", icon: "👤" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "roles", label: "Roles & Permissions", icon: "🔐" },
  ];

  // Profile Update Handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Updating profile:", profileData);
      // TODO: API call to update profile
      // await userApi.update(user?.id, profileData);
      alert("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset User Form
  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      role: "Billing Officer",
    });
    setEditingUserId(null);
  };

  // Open Add User Modal
  const openAddUserModal = () => {
    resetUserForm();
    setShowAddUserModal(true);
  };

  // Open Edit User Modal
  const openEditUserModal = (userToEdit: User) => {
    setEditingUserId(userToEdit.id);
    setUserFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: "",
      phone: "",
      department: "",
      role: userToEdit.role,
    });
    setShowEditUserModal(true);
  };

  // Handle Add/Update User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (editingUserId) {
        // Update existing user
        console.log("Updating user:", userFormData);
        // TODO: API call to update user
        // await userApi.update(editingUserId, userFormData);
        
        setUsers(prev =>
          prev.map(u =>
            u.id === editingUserId
              ? {
                  ...u,
                  name: userFormData.name,
                  email: userFormData.email,
                  role: userFormData.role,
                }
              : u
          )
        );
        alert("User updated successfully!");
        setShowEditUserModal(false);
      } else {
        // Create new user
        console.log("Creating new user:", userFormData);
        // TODO: API call to create user
        // await userApi.create(userFormData);
        
        const newUser: User = {
          id: Date.now().toString(),
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          permissions: ["view"],
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers(prev => [...prev, newUser]);
        alert("User created successfully!");
        setShowAddUserModal(false);
      }
      resetUserForm();
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("Deleting user:", userId);
      // TODO: API call to delete user
      // await userApi.delete(userId);
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Toggle User Status
  const handleToggleUserStatus = async (userId: string) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Toggling user status:", userId);
      // TODO: API call to toggle user status
      // await userApi.toggleStatus(userId);
      
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to toggle user status");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Add Role
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Adding role:", roleFormData);
      // TODO: API call to add role
      
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleFormData.name,
        description: roleFormData.description,
        permissions: [],
      };
      setRoles(prev => [...prev, newRole]);
      alert("Role created successfully!");
      setShowAddRoleModal(false);
      setRoleFormData({ name: "", description: "" });
    } catch (err: any) {
      setError(err.message || "Failed to add role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Manage your account, users, and system permissions</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">User Profile</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </button>
              <button
                type="button"
                className="px-6 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">User Management</h2>
              <button
                onClick={openAddUserModal}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                + Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-4 py-3 font-medium text-neutral-900">{userItem.name}</td>
                      <td className="px-4 py-3 text-neutral-600">{userItem.email}</td>
                      <td className="px-4 py-3 text-neutral-600">{userItem.role}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          userItem.isActive 
                            ? "bg-success-50 text-success-700" 
                            : "bg-neutral-100 text-neutral-600"
                        }`}>
                          {userItem.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 flex">
                        <button
                          onClick={() => openEditUserModal(userItem)}
                          className="px-3 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(userItem.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            userItem.isActive
                              ? "bg-warning-100 text-warning-700 hover:bg-warning-200"
                              : "bg-success-100 text-success-700 hover:bg-success-200"
                          }`}
                        >
                          {userItem.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-error-100 text-error-700 hover:bg-error-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Roles & Permissions</h2>
              <button
                onClick={() => setShowAddRoleModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                + Add Role
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">{role.name}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-neutral-700">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add New User</h3>
            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={userFormData.password}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select
                  required
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); resetUserForm(); }}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? "Creating..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Edit User</h3>
            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select
                  required
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditUserModal(false); resetUserForm(); }}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add New Role</h3>
            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? "Creating..." : "Add Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
