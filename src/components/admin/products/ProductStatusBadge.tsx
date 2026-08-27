import React from 'react';

interface ProductStatusBadgeProps {
  active: boolean;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ active }) => {
  if (active) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-container text-success">
        Activo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-highest text-outline">
      Inactivo
    </span>
  );
};
