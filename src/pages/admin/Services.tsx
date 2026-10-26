import React, { useState } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/api/services';
import type { TechService, CreateServiceInput } from '@/types';
import { Search, Plus, Edit, Trash2, Clock, DollarSign, CheckCircle, XCircle, Wrench } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const { data: rawServices, isLoading, isError } = useServices();
  const services: TechService[] = Array.isArray(rawServices)
    ? rawServices
    : (rawServices as any)?.items && Array.isArray((rawServices as any).items)
    ? (rawServices as any).items
    : [];
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<TechService | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateServiceInput>({
    name: '',
    description: '',
    estimatedPrice: 0,
    estimatedTimeMinutes: 60,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      estimatedPrice: 0,
      estimatedTimeMinutes: 60,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: TechService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      estimatedPrice: service.estimatedPrice ?? (service as any).price ?? 0,
      estimatedTimeMinutes: service.estimatedTimeMinutes ?? 60,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('El nombre del servicio es obligatorio');
      return;
    }

    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          data: formData,
        });
      } else {
        await createServiceMutation.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Ocurrió un error al guardar el servicio');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas desactivar/eliminar el servicio "${name}"?`)) {
      try {
        await deleteServiceMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.error?.message || 'Error al eliminar servicio');
      }
    }
  };

  // Derived & Filtered List
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? s.active !== false
        : s.active === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Gestión de Servicios Técnicos
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Administra el catálogo de servicios de mantenimiento y reparación ofrecidos por el taller.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-white hover:bg-primary/90 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:border-primary outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant font-medium">
            Cargando servicios técnicos...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-error font-medium">
            Error al cargar los servicios técnicos del servidor.
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            No se encontraron servicios que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                  <th className="py-3.5 px-6">Servicio</th>
                  <th className="py-3.5 px-6">Precio Estimado</th>
                  <th className="py-3.5 px-6">Tiempo Estimado</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {filteredServices.map((service) => {
                  const price = service.estimatedPrice ?? (service as any).price ?? 0;
                  const minutes = service.estimatedTimeMinutes ?? 60;
                  const isActive = service.active !== false;

                  return (
                    <tr key={service.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-on-surface">{service.name}</div>
                        <div className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                          {service.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-primary">
                        {price === 0 ? 'Gratis ($0)' : `$${price.toLocaleString('es-CO')} COP`}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        <div className="inline-flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-lg text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {minutes} min ({Math.round((minutes / 60) * 10) / 10}h)
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          title="Editar servicio"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.name)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                          title="Desactivar/Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-lg font-bold text-on-surface">
                {editingService ? 'Editar Servicio Técnico' : 'Nuevo Servicio Técnico'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-error-container text-error text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                  placeholder="Ej: Cambio de Pantalla iPhone 13"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                  placeholder="Detalles sobre el procedimiento, componentes que incluye..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Precio Estimado ($ COP) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="number"
                      min={0}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-9 pr-3 text-sm focus:border-primary outline-none"
                      value={formData.estimatedPrice}
                      onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Tiempo Estimado (Minutos) *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="number"
                      min={5}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-9 pr-3 text-sm focus:border-primary outline-none"
                      value={formData.estimatedTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedTimeMinutes: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {createServiceMutation.isPending || updateServiceMutation.isPending
                    ? 'Guardando...'
                    : editingService
                    ? 'Guardar Cambios'
                    : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
