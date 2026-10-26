import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Wrench, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminTechnicians } from '@/api/admin/technician-hooks';
import { useAssignTechnician } from '@/api/admin/work-orders';
import type { DashboardWorkOrder } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface AssignTechnicianFormProps {
  order: DashboardWorkOrder;
  onClose: () => void;
}

const AssignTechnicianForm: React.FC<AssignTechnicianFormProps> = ({ order, onClose }) => {
  const { toast } = useToast();
  const { data: techData, isLoading: loadingTechs, isError: errorTechs, refetch: refetchTechs } = useAdminTechnicians();
  const assignMutation = useAssignTechnician();

  const [selectedTechId, setSelectedTechId] = useState<string>(order.technicianId || '');

  const technicians = techData?.items || [];

  // Find currently assigned technician
  const currentTechnician = order.technicianId
    ? technicians.find((t) => t.id === order.technicianId)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTechId) {
      toast({
        title: 'Selección requerida',
        description: 'Debes seleccionar un técnico para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (order.technicianId && selectedTechId === order.technicianId) {
      toast({
        title: 'Técnico ya asignado',
        description: 'El técnico seleccionado ya se encuentra asignado a esta orden de servicio.',
      });
      onClose();
      return;
    }

    try {
      await assignMutation.mutateAsync({
        workOrderId: order.id,
        technicianId: selectedTechId,
      });

      const assignedTech = technicians.find((t) => t.id === selectedTechId);
      toast({
        title: 'Técnico asignado',
        description: `Se ha asignado a ${assignedTech?.fullName || 'el técnico'} a la orden ${order.guideNumber}.`,
      });

      onClose();
    } catch (err: any) {
      let errorMessage = 'No se pudo asignar el técnico a la orden de servicio.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error de asignación',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = assignMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
      {/* Order info summary */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-medium">Guía de la Orden:</span>
          <span className="font-bold text-on-surface">{order.guideNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-medium">Dispositivo:</span>
          <span className="text-on-surface">{order.deviceBrand} {order.deviceModel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-medium">Estado actual:</span>
          <span className="font-semibold text-primary">{order.currentStatus}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-outline-variant/40">
          <span className="text-on-surface-variant font-medium">Técnico actual:</span>
          <span className="text-on-surface font-medium">
            {currentTechnician ? (
              currentTechnician.fullName
            ) : order.technicianId ? (
              order.technicianId
            ) : (
              <span className="text-outline italic">No asignado</span>
            )}
          </span>
        </div>
      </div>

      {order.technicianId && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Esta orden ya cuenta con un técnico asignado. Ten en cuenta que si el taller tiene restringida la reasignación, el servidor rechazará cambios posteriores.
          </span>
        </div>
      )}

      {/* Technician Selector */}
      <div className="space-y-2">
        <label 
          htmlFor="technician-select" 
          className="block text-[13px] font-semibold text-[#191C1E] tracking-wider uppercase"
        >
          Técnico Responsable <span className="text-error">*</span>
        </label>

        {loadingTechs ? (
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            <span>Cargando directorio de técnicos...</span>
          </div>
        ) : errorTechs ? (
          <div className="p-3 rounded-lg border border-error/30 bg-error-container/20 text-error flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Error al cargar técnicos.</span>
            </div>
            <button
              type="button"
              onClick={() => refetchTechs()}
              className="underline text-xs font-semibold flex items-center gap-1 hover:text-error/80"
            >
              <RefreshCw className="w-3 h-3" /> Reintentar
            </button>
          </div>
        ) : technicians.length === 0 ? (
          <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-outline" />
            <span>No hay técnicos registrados en el sistema.</span>
          </div>
        ) : (
          <select
            id="technician-select"
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">-- Selecciona un técnico --</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.fullName} {tech.email ? `(${tech.email})` : ''} {!tech.active ? '— [Inactivo]' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t border-outline-variant">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-on-surface-variant hover:text-on-surface"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loadingTechs || !selectedTechId}
          className="w-full sm:w-auto bg-primary text-on-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : order.technicianId ? (
            'Cambiar Técnico'
          ) : (
            'Confirmar Asignación'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface AssignTechnicianDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: DashboardWorkOrder | null;
}

export const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">engineering</span>
            {order?.technicianId ? 'Cambiar Técnico Asignado' : 'Asignar Técnico a Orden'}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-1">
            Selecciona el técnico responsable para la atención de esta orden de servicio.
          </DialogDescription>
        </DialogHeader>

        {order && (
          <AssignTechnicianForm
            key={`${order.id}-${order.technicianId || 'unassigned'}`}
            order={order}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
