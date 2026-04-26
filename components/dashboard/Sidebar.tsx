/**
 * Dashboard Sidebar Component
 */

"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Invoices", href: "/dashboard/invoices", icon: "📋" },
  { name: "Payments", href: "/dashboard/payments", icon: "💳" },
  { name: "Patients", href: "/dashboard/patients", icon: "👥" },
  { name: "Reports", href: "/dashboard/reports", icon: "📈" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-neutral-900 text-white border-r border-neutral-800 transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        } hidden md:flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold">Efiche</h1>
              <p className="text-xs text-neutral-400">Billing</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isOpen ? "❮" : "❯"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors group"
              title={!isOpen ? item.name : ""}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          {isOpen && user && (
            <div className="px-4 py-3 bg-neutral-800 rounded-lg">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-error-600 transition-colors text-sm font-medium"
          >
            <span>🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button className="p-3 bg-white rounded-lg shadow-md border border-neutral-200">
          ☰
        </button>
      </div>
    </>
  );
}
