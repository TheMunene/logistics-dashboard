import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <div className={`w-4 h-4 ${iconColor}`}>{icon}</div>
        </div>
      </div>
      <div className="flex items-end">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {change && (
          <div className={`text-xs font-medium ${change.positive ? 'text-green-600' : 'text-red-600'} ml-2 mb-1`}>
            {change.positive ? '+' : ''}{change.value}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;