/**
 * Dashboard Layout with Sidebar
 */

import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <DashboardSidebar />
        <DashboardHeader />
        <main className="ml-0 md:ml-64 pt-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
