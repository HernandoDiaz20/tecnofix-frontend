import React, { useState } from 'react';
import { useAdminTechnicians, useToggleTechnicianStatus } from '@/api/admin/technician-hooks';
import { TechniciansTable } from '@/components/admin/technicians/TechniciansTable';
import { TechnicianForm } from '@/components/admin/technicians/TechnicianForm';
import { TechnicianWorkOrders } from '@/components/admin/technicians/TechnicianWorkOrders';
import { ConfirmDialog } from '@/components/admin/products/ConfirmDialog';
import type { Technician } from '@/types/technicians';
import { Search, Plus, FilterX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Technicians: React.FC = () => {
  const { toast } = useToast();
  const { data, isLoading } = useAdminTechnicians();
  const toggleMutation = useToggleTechnicianStatus();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWorkOrdersOpen, setIsWorkOrdersOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selected technician state
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

  // Frontend filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleViewWorkOrders = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsWorkOrdersOpen(true);
  };

  const handleToggleStatusClick = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedTechnician) return;

    try {
      await toggleMutation.mutateAsync({
        id: selectedTechnician.id,
        data: { active: !selectedTechnician.active }
      });
      toast({
        title: selectedTechnician.active ? 'Técnico desactivado' : 'Técnico activado',
        description: 'El estado del técnico se ha actualizado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del técnico.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  // Derived data
  const rawTechnicians = data?.items || [];

  // Frontend filtering
  const filteredTechnicians = rawTechnicians.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === ''
      ? true
      : statusFilter === 'active' ? t.active
        : statusFilter === 'inactive' ? !t.active
          : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-margin flex-1 flex flex-col gap-lg max-w-[1440px] mx-auto w-full">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface">Gestión de Técnicos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Directorio y gestión del personal técnico de TecnoFix.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={handleCreate}
            className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-[18px] h-[18px]" />
            Añadir Técnico
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col lg:flex-row gap-md items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/60"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-sm w-full lg:w-auto">
          <select
            className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer min-w-[150px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
            className="bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container p-2.5 rounded-lg transition-colors"
            title="Limpiar Filtros"
          >
            <FilterX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <TechniciansTable
        technicians={filteredTechnicians}
        isLoading={isLoading}
        onViewWorkOrders={handleViewWorkOrders}
        onToggleStatus={handleToggleStatusClick}
      />

      {/* Modals */}
      <TechnicianForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <TechnicianWorkOrders
        isOpen={isWorkOrdersOpen}
        onOpenChange={setIsWorkOrdersOpen}
        technician={selectedTechnician}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={selectedTechnician?.active ? "Desactivar Técnico" : "Activar Técnico"}
        description={`¿Estás seguro que deseas ${selectedTechnician?.active ? 'desactivar' : 'activar'} al técnico "${selectedTechnician?.fullName}"? ${selectedTechnician?.active ? 'No podrá iniciar sesión ni se le podrán asignar nuevas órdenes de servicio.' : 'Podrá iniciar sesión y recibir órdenes de servicio.'}`}
        confirmText={selectedTechnician?.active ? "Desactivar" : "Activar"}
        variant={selectedTechnician?.active ? "destructive" : "default"}
        onConfirm={confirmToggleStatus}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
};
