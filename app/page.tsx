import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Efiche</h1>
              <p className="text-sm text-neutral-600 mt-1">Healthcare Billing System</p>
            </div>
            <div className="hidden md:block">
              <Link
                href="/billing/V001"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                View Sample Invoice
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Smart Healthcare Billing
            </h2>
            <p className="text-lg text-neutral-700 mb-4">
              Manage patient invoices, process payments, and track insurance claims in one streamlined platform.
            </p>
            <p className="text-neutral-600 mb-8">
              Built for healthcare providers in Rwanda and East Africa.
            </p>
            <div className="flex gap-4">
              <Link
                href="/billing/V001"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                View Sample Invoice
              </Link>
              <Link
                href="/billing/V002"
                className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:text-primary-700 hover:border-primary-700 font-semibold rounded-lg transition-colors inline-block"
              >
                Another Sample
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg border border-primary-200 p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-neutral-700 font-medium">Professional Invoice Management</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧾",
                title: "Invoice Management",
                desc: "View, track, and manage patient invoices with detailed line items",
              },
              {
                icon: "💳",
                title: "Multiple Payment Methods",
                desc: "Accept cash, mobile money, and insurance payments",
              },
              {
                icon: "📱",
                title: "Mobile Money Integration",
                desc: "Real-time confirmation polling for mobile money transactions",
              },
              {
                icon: "🏥",
                title: "Insurance Support",
                desc: "API-driven insurance provider selection and coverage tracking",
              },
              {
                icon: "📊",
                title: "Responsive Design",
                desc: "Works seamlessly on desktop, tablet, and mobile devices",
              },
              {
                icon: "🔒",
                title: "Secure & Reliable",
                desc: "TypeScript-powered with comprehensive error handling",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-neutral-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-16">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">
            Built with Modern Tech
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 16", icon: "⚡" },
              { name: "React 19", icon: "⚛️" },
              { name: "TypeScript", icon: "📘" },
              { name: "Tailwind CSS", icon: "🎨" },
            ].map((tech, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{tech.icon}</div>
                <p className="font-medium text-neutral-900">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            View our sample invoices and see how the Efiche billing module can streamline your healthcare operations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/billing/V001"
              className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              View Invoice V001
            </Link>
            <Link
              href="/billing/V002"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              View Invoice V002
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-200 text-center text-neutral-600">
          <p className="text-sm">
            © 2026 Efiche Healthcare Billing. Built for Rwanda's healthcare providers.
          </p>
          <p className="text-xs mt-2">
            Made with care in Kigali, Rwanda 🇷🇼
          </p>
        </div>
      </div>
    </main>
  );
}
