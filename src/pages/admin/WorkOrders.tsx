import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminWorkOrders } from '@/api/admin-hooks';
import { useAdminTechnicians } from '@/api/admin/technician-hooks';
import { AssignTechnicianDialog } from '@/components/admin/work-orders/AssignTechnicianDialog';
import type { DashboardWorkOrder } from '@/types/dashboard';

export const WorkOrders: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  
  const navigate = useNavigate();
  
  const { data, isLoading, isError } = useAdminWorkOrders(page, pageSize, statusFilter, technicianFilter);
  const { data: techData } = useAdminTechnicians();
  const technicians = techData?.items || [];

  // Dropdown menu & dialog state
  const [menuOpenOrderId, setMenuOpenOrderId] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState<boolean>(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<DashboardWorkOrder | null>(null);

  const getTechnicianName = (technicianId: string | null) => {
    if (!technicianId) return 'No asignado';
    const tech = technicians.find((t) => t.id === technicianId);
    return tech ? tech.fullName : technicianId;
  };

  const getStatusBadge = (status: DashboardWorkOrder['currentStatus']) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-highest text-on-surface">Pendiente</span>;
      case 'ACEPTADA':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">Aceptada</span>;
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

  const handleOpenAssign = (order: DashboardWorkOrder) => {
    setSelectedOrderForAssign(order);
    setIsAssignDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Órdenes de Servicio</h2>
          <p className="text-on-surface-variant text-sm mt-1">Listado y gestión de todas las órdenes en el taller.</p>
        </div>
        <button className="bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> Nueva Orden
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col h-full mb-8">
        <div className="p-4 border-b border-outline-variant/50 flex flex-wrap gap-4 items-center bg-surface-bright">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Estado:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-outline-variant rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADA">Aceptada</option>
              <option value="INGRESADO">Ingresado</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="ESPERANDO_REPUESTO">Esperando Repuesto</option>
              <option value="EN_REPARACION">En Reparación</option>
              <option value="REPARADO">Reparado</option>
              <option value="LISTO_PARA_ENTREGA">Listo Para Entrega</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Técnico:</label>
            <select
              value={technicianFilter}
              onChange={(e) => { setTechnicianFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-outline-variant rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface"
            >
              <option value="">Todos los técnicos</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-low border-b border-outline-variant/50">
              <tr>
                <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Orden</th>
                <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Cliente</th>
                <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Dispositivo</th>
                <th className="py-3 px-6 text-sm font-semibold text-on-surface-variant">Técnico</th>
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
                    <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-24 animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-surface-container-high rounded-full w-24 animate-pulse"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-surface-container-high rounded w-20 animate-pulse"></div></td>
                    <td className="py-4 px-6 text-right"><div className="h-4 bg-surface-container-high rounded w-8 animate-pulse inline-block"></div></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-error font-medium">
                    <span className="material-symbols-outlined align-middle mr-2">error</span>
                    Error al cargar las órdenes de servicio.
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    No se encontraron órdenes de servicio.
                  </td>
                </tr>
              ) : (
                data.items.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-surface-bright transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/ordenes-servicio/${order.id}`)}
                  >
                    <td className="py-3 px-6 font-medium text-on-surface">{order.guideNumber}</td>
                    <td className="py-3 px-6">{order.customer?.fullName || 'Cliente no asignado'}</td>
                    <td className="py-3 px-6 text-on-surface-variant">{order.deviceBrand} {order.deviceModel}</td>
                    <td className="py-3 px-6 text-on-surface-variant font-medium">
                      {getTechnicianName(order.technicianId)}
                    </td>
                    <td className="py-3 px-6">{getStatusBadge(order.currentStatus)}</td>
                    <td className="py-3 px-6 text-on-surface-variant">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setMenuOpenOrderId(menuOpenOrderId === order.id ? null : order.id)}
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                        title="Acciones"
                        aria-label={`Acciones de orden ${order.guideNumber}`}
                      >
                        <span className="material-symbols-outlined text-sm">more_vert</span>
                      </button>

                      {menuOpenOrderId === order.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-20" 
                            onClick={() => setMenuOpenOrderId(null)} 
                          />
                          <div className="absolute right-6 top-10 z-30 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg py-1.5 text-left text-sm animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setMenuOpenOrderId(null);
                                handleOpenAssign(order);
                              }}
                              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-on-surface hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-primary">engineering</span>
                              <span>Asignar técnico</span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenOrderId(null);
                                navigate(`/admin/ordenes-servicio/${order.id}`);
                              }}
                              className="w-full px-4 py-2.5 flex items-center gap-2.5 text-on-surface hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-on-surface-variant">visibility</span>
                              <span>Ver detalle</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="p-4 border-t border-outline-variant/50 bg-surface-bright flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">
              Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, data.total)} de {data.total} resultados
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-outline-variant rounded-md text-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= data.total}
                className="px-3 py-1 border border-outline-variant rounded-md text-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Technician Modal */}
      <AssignTechnicianDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        order={selectedOrderForAssign}
      />
    </>
  );
};
