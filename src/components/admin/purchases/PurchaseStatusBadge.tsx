import React from 'react';
import type { PurchaseStatus } from '@/types/purchases';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, ShoppingCart } from 'lucide-react';

interface PurchaseStatusBadgeProps {
  status: PurchaseStatus;
  className?: string;
}

export const PurchaseStatusBadge: React.FC<PurchaseStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = (status: PurchaseStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return {
          label: 'Pendiente',
          className: 'bg-warning-container text-warning border-warning/20',
          icon: Clock,
        };
      case 'ORDENADO':
        return {
          label: 'Ordenado',
          className: 'bg-primary-container text-primary border-primary/20',
          icon: ShoppingCart,
        };
      case 'RECIBIDO':
        return {
          label: 'Recibido',
          className: 'bg-success-container text-success border-success/20',
          icon: CheckCircle2,
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          className: 'bg-error-container text-error border-error/20',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          className: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};
