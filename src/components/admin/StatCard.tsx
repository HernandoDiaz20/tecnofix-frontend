import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  isLoading, 
  isError 
}) => {
  return (
    <Card className="border-outline-variant shadow-sm bg-surface">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm font-medium text-on-surface-variant mb-1">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-surface-container-high rounded animate-pulse mt-1" />
            ) : isError ? (
              <div className="text-error font-medium text-sm mt-1">Error al cargar</div>
            ) : (
              <div className="text-h2 font-bold text-on-surface font-data-mono tracking-tight">
                {value}
              </div>
            )}
            {description && !isLoading && !isError && (
              <p className="text-xs text-on-surface-variant mt-2 font-medium">
                {description}
              </p>
            )}
          </div>
          <div className="p-3 bg-surface-container-low rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
