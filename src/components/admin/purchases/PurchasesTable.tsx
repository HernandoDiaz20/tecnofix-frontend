import React from 'react';
import type { PurchaseRequest } from '@/types/purchases';
import { PurchaseStatusBadge } from './PurchaseStatusBadge';
import { Eye, Clock, Download, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PurchasesTableProps {
  purchases: PurchaseRequest[];
  isLoading: boolean;
  onView: (purchase: PurchaseRequest) => void;
  onChangeStatus?: (purchase: PurchaseRequest) => void;
  onReceive?: (purchase: PurchaseRequest) => void;
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({
  purchases,
  isLoading,
  onView,
  onChangeStatus,
  onReceive,
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Cargando compras...</p>
      </div>
    );
  }

  if (!purchases?.length) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-on-surface-variant" />
        </div>
        <h3 className="font-h3 text-h3 text-on-surface mb-2">No hay compras registradas</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Aún no se han registrado compras en el sistema. Registra tu primera compra usando el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Proveedor</th>
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Artículos</th>
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-body-md text-on-surface font-medium">
                      {format(new Date(purchase.createdAt), "dd MMM yyyy", { locale: es })}
                    </span>
                    <span className="font-body-sm text-on-surface-variant text-xs">
                      {format(new Date(purchase.createdAt), "HH:mm")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-body-md text-on-surface font-medium truncate max-w-[200px]">
                      {purchase.supplierId || 'Sin proveedor'}
                    </span>
                    <span className="font-data-mono text-xs text-on-surface-variant truncate max-w-[200px]">
                      {purchase.id.split('-')[0]}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-data-mono text-sm">
                    {purchase.totalItems} {purchase.totalItems === 1 ? 'item' : 'items'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-data-mono text-on-surface font-medium">
                    ${purchase.total.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <PurchaseStatusBadge status={purchase.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(purchase)}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                      title="Ver Detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {purchase.status === 'PENDIENTE' && onChangeStatus && (
                      <button
                        onClick={() => onChangeStatus(purchase)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-primary transition-colors"
                        title="Gestionar Estado"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    
                    {purchase.status === 'ORDENADO' && onReceive && (
                      <button
                        onClick={() => onReceive(purchase)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-success-container hover:text-success transition-colors"
                        title="Recibir Compra"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
