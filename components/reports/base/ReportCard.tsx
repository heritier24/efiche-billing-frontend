"use client";

import React from 'react';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  className = ""
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            {icon && <div className="text-2xl mr-3">{icon}</div>}
            <div>
              <p className="text-sm font-medium text-neutral-600">{title}</p>
              <p className="text-2xl font-bold text-neutral-900">
                {loading ? (
                  <div className="animate-pulse">Loading...</div>
                ) : typeof value === 'number' ? (
                  formatCurrency(value)
                ) : (
                  value
                )}
              </p>
              {subtitle && (
                <p className="text-sm text-neutral-600">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${getTrendColor(trend.direction)}`}>
                {getTrendIcon(trend.direction)}
              </span>
              <span className="font-medium">
                {trend.direction === 'up' && '+'}
                {formatNumber(Math.abs(trend.value))}
                {trend.direction === 'down' && '-'}
                {trend.direction === 'neutral' && '±'}
                %
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
