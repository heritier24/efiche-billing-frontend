/**
 * Empty State Component
 * Displayed when no invoice exists for the visit
 */

interface EmptyStateProps {
  visitId: string;
  onRetry?: () => void;
}

export default function EmptyState({ visitId, onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Empty State Icon */}
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Empty State Content */}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Invoice Found
        </h3>
        <p className="text-gray-600 mb-6">
          There is no invoice available for visit #{visitId}. 
          This could mean the visit hasn't been billed yet or the invoice is being processed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Need Help?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Contact the billing department</li>
            <li>• Check if the visit is completed</li>
            <li>• Verify the visit ID is correct</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
