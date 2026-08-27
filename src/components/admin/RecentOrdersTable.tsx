import React from 'react';
import type { DashboardWorkOrder } from '@/types/dashboard';

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
  const getStatusBadge = (status: DashboardWorkOrder['currentStatus'] | undefined) => {
    switch (status) {
      case 'INGRESADO':
      case 'EN_REVISION':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">En Diagnóstico</span>;
      case 'ESPERANDO_REPUESTO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-highest text-on-surface">Esperando Pieza</span>;
      case 'EN_REPARACION':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">En Reparación</span>;
      case 'REPARADO':
      case 'LISTO_PARA_ENTREGA':
      case 'ENTREGADO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-on-secondary">Completado</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-highest text-on-surface">Desconocido</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm text-center h-full">
        <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
        <p className="text-on-surface-variant text-sm font-medium">Error al cargar las órdenes recientes.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center bg-surface-bright">
        <h3 className="text-xl font-semibold text-on-surface">Órdenes Recientes</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-outline-variant rounded-md text-sm font-semibold hover:bg-surface-container transition-colors">Filtrar</button>
          <button className="px-3 py-1.5 border border-outline-variant rounded-md text-sm font-semibold hover:bg-surface-container transition-colors">Exportar</button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-surface-container-low border-b border-outline-variant/50">
            <tr>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Orden</th>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Cliente</th>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Dispositivo</th>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Estado</th>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Fecha</th>
              <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-outline-variant/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-surface-bright transition-colors">
                  <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-20 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-32 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-32 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-5 bg-surface-container-high rounded-full w-24 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-20 animate-pulse"></div></td>
                  <td className="py-4 px-6 text-right"><div className="h-4 bg-surface-container-high rounded w-8 animate-pulse inline-block"></div></td>
                </tr>
              ))
            ) : !orders || orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                  No hay órdenes registradas aún.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-bright transition-colors cursor-pointer">
                  <td className="py-3 px-6 font-medium text-on-surface">{order.guideNumber}</td>
                  <td className="py-3 px-6">{order.customer?.fullName || 'Cliente no asignado'}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.deviceBrand} {order.deviceModel}</td>
                  <td className="py-3 px-6">{getStatusBadge(order.currentStatus)}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-6 text-right">
                    <button className="text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-outline-variant/50 bg-surface-bright flex justify-center mt-auto">
        <button className="text-primary text-sm font-semibold hover:underline">Ver Todas las Órdenes</button>
      </div>
    </div>
  );
};

