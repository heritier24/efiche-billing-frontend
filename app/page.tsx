import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Efiche Billing System
          </h1>
          <p className="text-xl text-gray-600">
            Healthcare invoicing and payment management
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome 👋
          </h2>
          <p className="text-gray-700 mb-4">
            This is a production-ready billing module built with Next.js, TypeScript, and Tailwind CSS.
          </p>
          <p className="text-gray-600 mb-6">
            Features include:
          </p>
          <ul className="space-y-2 mb-6 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Invoice viewing and management
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Itemized charge breakdown
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Multiple payment methods (Cash, Mobile Money, Insurance)
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Mobile money confirmation polling
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Insurance provider selection
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-3">✓</span> Responsive design
            </li>
          </ul>

          {/* Test Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test the Billing Page:</h3>
            <div className="space-y-2 flex flex-col">
              <Link
                href="/billing/V001"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Open Sample Invoice (Visit ID: V001)
              </Link>
              <Link
                href="/billing/V002"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Open Sample Invoice (Visit ID: V002)
              </Link>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Project Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📁 Directories</h3>
              <code className="text-gray-700 block mb-2">
                app/billing/[visitId]/page.tsx
              </code>
              <code className="text-gray-700 block mb-2">
                components/billing/
              </code>
              <code className="text-gray-700 block">
                lib/api/ &amp; lib/types/
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ Tech Stack</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Next.js 16 (App Router)</li>
                <li>• React 19 with Hooks</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS 4</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
