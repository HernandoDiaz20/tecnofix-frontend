import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string; // Material symbol icon name
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  isLoading,
  isError
}) => {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/50 flex flex-col justify-between min-h-[110px]">
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant text-sm font-medium">{title}</span>
        <div className="p-1.5 bg-surface-container rounded-md">
          <span className="material-symbols-outlined text-outline text-[18px] leading-none">{icon}</span>
        </div>
      </div>
      <div className="mt-2">
        {isLoading ? (
          <div className="h-8 w-16 bg-surface-container-high rounded animate-pulse" />
        ) : isError ? (
          <div className="text-error font-medium text-sm">Error al cargar</div>
        ) : (
          <span className="text-3xl font-semibold text-on-surface tracking-tight">{value}</span>
        )}
      </div>
    </div>
  );
};
