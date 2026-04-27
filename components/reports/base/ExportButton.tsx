"use client";

interface ExportButtonProps {
  onExport: (format: string) => void;
  loading?: boolean;
  disabled?: boolean;
  format?: 'pdf' | 'excel' | 'csv';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  loading = false,
  disabled = false,
  format = 'pdf',
  className = ""
}) => {
  const getIcon = () => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📄';
    }
  };

  const getLabel = () => {
    switch (format) {
      case 'pdf':
        return 'Export PDF';
      case 'excel':
        return 'Export Excel';
      case 'csv':
        return 'Export CSV';
      default:
        return 'Export';
    }
  };

  return (
    <button
      onClick={() => onExport(format)}
      disabled={disabled || loading}
      className={`px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 border-t-transparent mr-2"></div>
          <span>Exporting...</span>
        </div>
      ) : (
        <>
          <span className="mr-2">{getIcon()}</span>
          <span>{getLabel()}</span>
        </>
      )}
    </button>
  );
};
