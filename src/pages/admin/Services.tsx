import React, { useState } from 'react';
import { 
  useAdminServices, 
  useToggleServiceStatus, 
  useDeactivateService 
} from '@/api/admin/service-hooks';
import { ServicesTable } from '@/components/admin/services/ServicesTable';
import { ServiceForm } from '@/components/admin/services/ServiceForm';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search, FilterX, AlertCircle, RefreshCw } from 'lucide-react';
import type { Service } from '@/types/services';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export const Services: React.FC = () => {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useAdminServices();
  const toggleMutation = useToggleServiceStatus();
  const deactivateMutation = useDeactivateService();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Selected service
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleCreate = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleDeactivateClick = (service: Service) => {
    setSelectedService(service);
    setIsDeactivateOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedService) return;

    try {
      await deactivateMutation.mutateAsync(selectedService.id);
      toast({
        title: 'Servicio desactivado',
        description: `El servicio "${selectedService.name}" ha sido desactivado correctamente.`,
      });
      setIsDeactivateOpen(false);
    } catch (err) {
      let errorMessage = 'No se pudo desactivar el servicio.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsDeactivateOpen(false);
    }
  };

  const handleActivateClick = async (service: Service) => {
    try {
      await toggleMutation.mutateAsync({
        id: service.id,
        data: { active: true },
      });
      toast({
        title: 'Servicio activado',
        description: `El servicio "${service.name}" está activo y visible en el catálogo público.`,
      });
    } catch (err) {
      let errorMessage = 'No se pudo activar el servicio.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Filter items in memory
  const rawServices = data?.items || [];
  const filteredServices = rawServices.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? s.active
        : !s.active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-background tracking-tight">Servicios</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestión del catálogo de servicios técnicos y tarifas oficiales
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary text-on-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo servicio
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Estado:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-outline-variant rounded-lg px-3 py-1.5 text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos ({rawServices.length})</option>
              <option value="active">
                Activos ({rawServices.filter((s) => s.active).length})
              </option>
              <option value="inactive">
                Inactivos ({rawServices.filter((s) => !s.active).length})
              </option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium px-2 py-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isError ? (
        <div className="bg-surface border border-error/20 rounded-xl p-10 text-center shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface">Error al cargar servicios</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {(error as any)?.message || 'No fue posible obtener el listado de servicios del servidor.'}
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="mt-2 text-primary border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      ) : (
        <ServicesTable
          services={filteredServices}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDeactivate={handleDeactivateClick}
          onActivate={handleActivateClick}
        />
      )}

      {/* Create / Edit Modal */}
      <ServiceForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        service={selectedService}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        title="Desactivar Servicio"
        description={`¿Estás seguro de que deseas desactivar el servicio "${selectedService?.name}"? Dejará de mostrarse en el catálogo público y no podrá ser solicitado por clientes hasta que sea reactivado.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeactivate}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
};
