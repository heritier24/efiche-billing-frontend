/**
 * Dashboard Header Component
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="ml-0 md:ml-64 px-6 py-4 flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600">Welcome back, {user?.name}</p>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200">
            <span className="text-lg">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
}
