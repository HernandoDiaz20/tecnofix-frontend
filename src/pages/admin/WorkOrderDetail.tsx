import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useAdminWorkOrderDetail,
  useAdminWorkOrderHistory,
  useAdminWorkOrderDiagnostics
} from '@/api/admin-hooks';

const STATUS_FLOW = [
  'INGRESADO',
  'EN_REVISION',
  'ESPERANDO_REPUESTO',
  'EN_REPARACION',
  'REPARADO',
  'LISTO_PARA_ENTREGA',
  'ENTREGADO'
];

const STATUS_LABELS: Record<string, string> = {
  'INGRESADO': 'Ingreso',
  'EN_REVISION': 'Revisión',
  'ESPERANDO_REPUESTO': 'Repuesto',
  'EN_REPARACION': 'Reparación',
  'REPARADO': 'Reparado',
  'LISTO_PARA_ENTREGA': 'Listo',
  'ENTREGADO': 'Entregado'
};

export const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading: loadingOrder, isError: errorOrder } = useAdminWorkOrderDetail(id);
  const { data: history, isLoading: loadingHistory, isError: errorHistory } = useAdminWorkOrderHistory(id);
  const { data: diagnostics, isLoading: loadingDiagnostics, isError: errorDiagnostics } = useAdminWorkOrderDiagnostics(id);

  if (loadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-medium">Cargando detalles de la orden...</p>
      </div>
    );
  }

  if (errorOrder || !order) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/50 text-center">
        <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Orden no encontrada</h2>
        <p className="text-on-surface-variant mb-6">No se pudo cargar la información de la orden o no existe.</p>
        <Link to="/admin/ordenes-servicio" className="text-primary font-semibold hover:underline">Volver a Órdenes</Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.currentStatus);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
        <Link to="/admin/ordenes-servicio" className="hover:text-primary transition-colors">Órdenes de Servicio</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface">Orden {order.guideNumber}</span>
      </div>

      {/* Header */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Orden {order.guideNumber}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
              {STATUS_LABELS[order.currentStatus] || order.currentStatus}
            </span>
          </div>
          <p className="text-on-surface-variant font-medium">
            Cliente: <span className="text-on-surface">{order.customer?.fullName || 'No asignado'}</span> • 
            Dispositivo: <span className="text-on-surface">{order.deviceBrand} {order.deviceModel}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">inventory_2</span> Agregar Repuesto
          </button>
          <button className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span> Registrar Entrega
          </button>
          <button className="bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">sync</span> Actualizar Estado
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 overflow-x-auto">
        <div className="min-w-[700px] flex justify-between items-center relative">
          <div className="absolute left-6 right-6 top-5 h-1 bg-surface-container-high -z-10"></div>
          {STATUS_FLOW.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            return (
              <div key={status} className="flex flex-col items-center gap-2 relative z-10 w-24">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-surface-container-lowest transition-colors ${isCompleted ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {isCompleted ? <span className="material-symbols-outlined text-lg">check</span> : (index + 1)}
                </div>
                <span className={`text-xs font-semibold text-center ${isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Información */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span> Información
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-on-surface-variant text-sm font-medium">Cliente</span>
              <span className="text-on-surface text-sm font-medium text-right">{order.customer?.fullName || 'No asignado'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-on-surface-variant text-sm font-medium">Técnico Asignado</span>
              <span className="text-on-surface text-sm font-medium text-right">{order.technicianId || 'No asignado'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-on-surface-variant text-sm font-medium">Dispositivo</span>
              <span className="text-on-surface text-sm font-medium text-right">{order.deviceBrand} {order.deviceModel}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-on-surface-variant text-sm font-medium">IMEI/Serial</span>
              <span className="text-on-surface text-sm font-medium text-right">{order.deviceSerial}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-on-surface-variant text-sm font-medium">Fecha Ingreso</span>
              <span className="text-on-surface text-sm font-medium text-right">{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Diagnóstico Técnico */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">build</span> Diagnóstico Técnico
          </h3>
          <div className="flex flex-col md:flex-row gap-4 h-full">
            <div className="flex-1 bg-surface-container-low p-4 rounded-lg">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Problema Reportado (Cliente)</h4>
              <p className="text-sm text-on-surface italic">"{order.problemDescription}"</p>
            </div>
            <div className="flex-1 bg-primary-container/20 p-4 rounded-lg border border-primary-container">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Diagnóstico Técnico</h4>
              {loadingDiagnostics ? (
                <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : errorDiagnostics ? (
                <p className="text-sm text-error font-medium">Error al cargar diagnóstico</p>
              ) : diagnostics && diagnostics.length > 0 ? (
                <div className="text-sm text-on-surface space-y-2">
                  <p><strong>Observaciones:</strong> {diagnostics[0].observations}</p>
                  <p><strong>Fallas:</strong> {diagnostics[0].faults}</p>
                  <p><strong>Acciones:</strong> {diagnostics[0].recommendedActions}</p>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">Diagnóstico técnico no disponible aún.</p>
              )}
            </div>
          </div>
        </div>

        {/* Estado de Ingreso */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">fact_check</span> Estado de Ingreso
          </h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
              Información validada al ingreso
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <span className="material-symbols-outlined text-outline text-sm">info</span>
              Accesorios: {order.accessories || 'Ninguno'}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Fotos de Ingreso</h4>
            <div className="bg-surface-container-low h-24 rounded-lg flex items-center justify-center text-on-surface-variant text-sm font-medium border border-dashed border-outline">
              Sin fotografías registradas
            </div>
          </div>
        </div>

        {/* Actividades y Repuestos (Split) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Actividades */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span> Actividades
            </h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {loadingHistory ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : errorHistory ? (
                <p className="text-sm text-error font-medium text-center">Error al cargar historial</p>
              ) : history && history.length > 0 ? (
                <div className="relative border-l-2 border-surface-container-highest ml-3 space-y-6 pb-4">
                  {history.map((h) => (
                    <div key={h.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest"></div>
                      <div className="bg-surface-container-low p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-on-surface">Estado actualizado</span>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(h.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-xs">De <span className="font-semibold">{h.fromStatus}</span> a <span className="font-semibold">{h.toStatus}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant text-center italic mt-8">Historial de actividades no disponible.</p>
              )}
            </div>
          </div>

          {/* Repuestos */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings_applications</span> Repuestos
              </div>
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-surface-container-low rounded-lg border border-dashed border-outline">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 opacity-50">inventory</span>
              <p className="text-on-surface-variant text-sm font-medium">Listado de repuestos no disponible</p>
              <p className="text-xs text-outline mt-1 max-w-[200px]">La visualización de repuestos asignados aún no está implementada en el sistema.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-sm font-bold text-on-surface-variant">TOTAL REPUESTOS</span>
              <span className="text-lg font-bold text-on-surface">$ 0.00</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
