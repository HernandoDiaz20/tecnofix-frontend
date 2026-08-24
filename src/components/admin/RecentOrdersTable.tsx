import React from 'react';
import type { DashboardWorkOrder } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: DashboardWorkOrder[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ 
  orders, 
  isLoading, 
  isError 
}) => {
  const getStatusColor = (status: DashboardWorkOrder['currentStatus'] | undefined) => {
    switch (status) {
      case 'INGRESADO': return 'bg-primary/10 text-primary';
      case 'EN_REVISION': return 'bg-primary/10 text-primary';
      case 'ESPERANDO_REPUESTO': return 'bg-[#f59e0b]/10 text-[#d97706]';
      case 'EN_REPARACION': return 'bg-[#f59e0b]/10 text-[#d97706]';
      case 'REPARADO': return 'bg-[#10b981]/10 text-[#059669]';
      case 'LISTO_PARA_ENTREGA': return 'bg-[#10b981]/10 text-[#059669]';
      case 'ENTREGADO': return 'bg-outline-variant/30 text-on-surface-variant';
      default: return 'bg-surface-container-high text-on-surface';
    }
  };

  const getStatusLabel = (status: DashboardWorkOrder['currentStatus'] | undefined) => {
    if (!status) return 'Desconocido';
    return status.replace(/_/g, ' ');
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-xl border border-outline-variant shadow-sm text-center">
        <AlertCircle className="w-10 h-10 text-error mb-4" />
        <p className="text-on-surface-variant font-medium">Error al cargar las órdenes recientes.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm h-full">
      <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface">
        <h3 className="text-h3 font-semibold text-on-surface">Últimas Órdenes Recibidas</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">
          Ver Todas <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID Orden</th>
              <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cliente</th>
              <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Equipo</th>
              <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant">
                  <td className="py-3 px-5"><div className="h-4 bg-surface-container-high rounded w-20 animate-pulse"></div></td>
                  <td className="py-3 px-5"><div className="h-4 bg-surface-container-high rounded w-32 animate-pulse"></div></td>
                  <td className="py-3 px-5"><div className="h-4 bg-surface-container-high rounded w-32 animate-pulse"></div></td>
                  <td className="py-3 px-5"><div className="h-5 bg-surface-container-high rounded-full w-24 animate-pulse"></div></td>
                </tr>
              ))
            ) : !orders || orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                  No hay órdenes registradas aún.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer last:border-0">
                  <td className="py-3 px-5 font-data-mono text-on-surface-variant text-xs">{order.guideNumber}</td>
                  <td className="py-3 px-5 font-medium text-on-surface">{order.customer?.fullName || 'Cliente no asignado'}</td>
                  <td className="py-3 px-5 text-on-surface-variant">{order.deviceBrand} {order.deviceModel}</td>
                  <td className="py-3 px-5">
                    <Badge variant="outline" className={`border-0 font-medium text-[11px] px-2 py-0.5 ${getStatusColor(order.currentStatus)}`}>
                      {getStatusLabel(order.currentStatus)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
