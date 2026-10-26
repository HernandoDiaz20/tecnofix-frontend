import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useWorkOrders,
  useCreateWorkOrder,
  useTransitionOrderStatus,
} from '@/api/work-orders';
import type { WorkOrder, OrderStatus, CreateWorkOrderInput } from '@/types';
import {
  Search,
  Plus,
  Eye,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  ArrowRightLeft,
  FileCheck,
} from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string; icon: any }[] = [
  { value: 'INGRESADO', label: 'Ingresado', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: Clock },
  { value: 'EN_REVISION', label: 'En Revisión', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Search },
  { value: 'ESPERANDO_REPUESTO', label: 'Esperando Repuesto', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle },
  { value: 'EN_REPARACION', label: 'En Reparación', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Wrench },
  { value: 'REPARADO', label: 'Reparado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
  { value: 'LISTO_PARA_ENTREGA', label: 'Listo para Entrega', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: PackageCheck },
  { value: 'ENTREGADO', label: 'Entregado', color: 'bg-gray-200 text-gray-800 border-gray-300', icon: FileCheck },
];

export const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError } = useWorkOrders({
    page,
    pageSize,
    status: statusFilter || undefined,
    searchText: searchTerm || undefined,
  });

  const createOrderMutation = useCreateWorkOrder();
  const transitionStatusMutation = useTransitionOrderStatus();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateWorkOrderInput>({
    deviceBrand: '',
    deviceModel: '',
    deviceSerial: '',
    problemDescription: '',
    devicePassword: '',
    accessories: '',
  });

  // Transition Status Modal State
  const [transitionOrder, setTransitionOrder] = useState<WorkOrder | null>(null);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<OrderStatus>('EN_REVISION');

  const handleOpenCreateModal = () => {
    setFormData({
      deviceBrand: '',
      deviceModel: '',
      deviceSerial: '',
      problemDescription: '',
      devicePassword: '',
      accessories: '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceBrand.trim() || !formData.deviceModel.trim() || !formData.problemDescription.trim()) {
      setFormError('La marca, modelo y descripción del problema son obligatorios.');
      return;
    }

    try {
      const created = await createOrderMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      navigate(`/admin/ordenes/${created.id}`);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Error al crear la orden de trabajo.');
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionOrder) return;

    try {
      await transitionStatusMutation.mutateAsync({
        id: transitionOrder.id,
        data: { toStatus: selectedTargetStatus },
      });
      setTransitionOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al cambiar el estado de la orden');
    }
  };

  const orders = data?.items || [];
  const totalOrders = data?.total || 0;
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

  const getStatusBadge = (status: OrderStatus) => {
    const config = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Órdenes de Servicio
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestión integral de recepción, diagnóstico, reparación y entrega de equipos en el taller.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-white hover:bg-primary/90 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden de Trabajo
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Buscar por # Guía, marca, modelo o serie..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            className="bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:border-primary outline-none cursor-pointer min-w-[180px]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los Estados</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPage(1);
              }}
              className="bg-surface-container-low hover:bg-surface-container border border-outline-variant p-2.5 rounded-xl transition-colors text-on-surface"
              title="Limpiar Filtros"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant font-medium">
            Cargando órdenes de trabajo...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-error font-medium">
            Error al conectar con el servidor para consultar órdenes de trabajo.
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            No se encontraron órdenes de trabajo registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                  <th className="py-3.5 px-6">Guía</th>
                  <th className="py-3.5 px-6">Dispositivo</th>
                  <th className="py-3.5 px-6">Problema Reportado</th>
                  <th className="py-3.5 px-6">Estado Actual</th>
                  <th className="py-3.5 px-6">Fecha Registro</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-primary">
                      {order.guideNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-on-surface">
                        {order.deviceBrand} {order.deviceModel}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        S/N: {order.deviceSerial || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs text-on-surface-variant">
                      <p className="line-clamp-2 text-xs">{order.problemDescription}</p>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(order.currentStatus)}</td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setTransitionOrder(order);
                          setSelectedTargetStatus(order.currentStatus);
                        }}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        title="Cambiar estado"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/ordenes/${order.id}`)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low">
            <span className="text-xs text-on-surface-variant">
              Página {page} de {totalPages} ({totalOrders} órdenes en total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Orden */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-lg font-bold text-on-surface">Recepción de Nueva Orden de Trabajo</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-error-container text-error text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Marca del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="Ej: Apple, Samsung, Asus"
                    value={formData.deviceBrand}
                    onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Modelo del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="Ej: iPhone 13 Pro, Galaxy S22"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Número de Serie / IMEI
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                  placeholder="Ej: F2LDK9283L0"
                  value={formData.deviceSerial}
                  onChange={(e) => setFormData({ ...formData, deviceSerial: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Falla / Problema Reportado *
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                  placeholder="Describa los síntomas reportados por el cliente..."
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Clave / Patrón Acceso
                  </label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="Ej: 1234 o Patrón N"
                    value={formData.devicePassword}
                    onChange={(e) => setFormData({ ...formData, devicePassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Accesorios Dejados
                  </label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="Ej: Cargador, Funda, Sim"
                    value={formData.accessories}
                    onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? 'Creando Orden...' : 'Ingresar Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transición de Estado */}
      {transitionOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-lg font-bold text-on-surface">Actualizar Estado de Orden</h3>
              <button
                onClick={() => setTransitionOrder(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusChange} className="p-6 space-y-4">
              <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
                <div className="font-bold text-primary">Guía: {transitionOrder.guideNumber}</div>
                <div className="text-on-surface">
                  {transitionOrder.deviceBrand} {transitionOrder.deviceModel}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nuevo Estado
                </label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none cursor-pointer"
                  value={selectedTargetStatus}
                  onChange={(e) => setSelectedTargetStatus(e.target.value as OrderStatus)}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setTransitionOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={transitionStatusMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {transitionStatusMutation.isPending ? 'Guardando...' : 'Actualizar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
