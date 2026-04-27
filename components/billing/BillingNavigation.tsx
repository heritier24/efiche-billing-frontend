"use client";

import { useRouter } from "next/navigation";

interface BillingNavigationProps {
  visitId: string;
  currentStep?: "overview" | "payment" | "receipt";
}

export default function BillingNavigation({ visitId, currentStep = "overview" }: BillingNavigationProps) {
  const router = useRouter();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
      description: "Back to main dashboard"
    },
    {
      name: "Invoices",
      href: "/dashboard/invoices",
      icon: "📄",
      description: "View all invoices"
    },
    {
      name: "Billing",
      href: `/billing/${visitId}/visit-billing`,
      icon: "💳",
      description: "Current billing page",
      active: true
    }
  ];

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Go back"
            >
              <span className="text-lg">←</span>
            </button>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-neutral-500">Navigation:</span>
              {navigationItems.map((item, index) => (
                <div key={item.href} className="flex items-center space-x-2">
                  {index > 0 && (
                    <span className="text-neutral-400">/</span>
                  )}
                  <button
                    onClick={() => router.push(item.href)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      item.active
                        ? "bg-primary-100 text-primary-700"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Context */}
          <div className="text-right">
            <p className="text-sm text-neutral-500">Visit ID</p>
            <p className="font-semibold text-neutral-900">#{visitId}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
