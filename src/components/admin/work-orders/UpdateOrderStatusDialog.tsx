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
import { Loader2, AlertCircle } from 'lucide-react';
import { useTransitionOrderStatus } from '@/api/admin/work-orders';
import type { DashboardWorkOrder } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

// Máquina de estados oficial del backend (STATUS_TRANSITIONS)
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ['ACEPTADA'],
  ACEPTADA: ['EN_REVISION'],
  EN_REVISION: ['ESPERANDO_REPUESTO', 'EN_REPARACION'],
  ESPERANDO_REPUESTO: ['EN_REPARACION'],
  EN_REPARACION: ['REPARADO'],
  REPARADO: ['LISTO_PARA_ENTREGA'],
  LISTO_PARA_ENTREGA: ['ENTREGADO'],
  ENTREGADO: [],
};

const STATUS_NAMES: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  INGRESADO: 'Ingresado',
  EN_REVISION: 'En Revisión (Diagnóstico)',
  ESPERANDO_REPUESTO: 'Esperando Repuesto',
  EN_REPARACION: 'En Reparación',
  REPARADO: 'Reparado',
  LISTO_PARA_ENTREGA: 'Listo para Entrega',
  ENTREGADO: 'Entregado al Cliente',
};

interface UpdateOrderStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: DashboardWorkOrder | null;
}

export const UpdateOrderStatusDialog: React.FC<UpdateOrderStatusDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  const { toast } = useToast();
  const transitionMutation = useTransitionOrderStatus();

  // Estados permitidos según el estado actual
  const currentStatus = order?.currentStatus || 'PENDIENTE';
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  const [selectedStatus, setSelectedStatus] = useState<string>(validNextStatuses[0] || '');

  // Sincronizar selección si cambia el estado o se abre el diálogo
  React.useEffect(() => {
    if (validNextStatuses.length > 0) {
      setSelectedStatus(validNextStatuses[0]);
    } else {
      setSelectedStatus('');
    }
  }, [order?.currentStatus, isOpen]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStatus) {
      toast({
        title: 'Estado requerido',
        description: 'Debes seleccionar un estado destino válido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        workOrderId: order.id,
        toStatus: selectedStatus,
      });

      toast({
        title: 'Estado actualizado',
        description: `La orden ${order.guideNumber} cambió a "${STATUS_NAMES[selectedStatus] || selectedStatus}".`,
      });

      onOpenChange(false);
    } catch (err: any) {
      let errorMessage = 'No se pudo actualizar el estado de la orden.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error de transición',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = transitionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sync</span>
            Actualizar Estado de la Orden
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-1">
            Transiciona la orden de servicio según el flujo operativo del taller.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Resumen actual */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Guía:</span>
              <span className="font-bold text-on-surface">{order.guideNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Estado actual:</span>
              <span className="font-semibold text-primary px-2 py-0.5 rounded-full bg-primary-container/20 text-xs">
                {STATUS_NAMES[order.currentStatus] || order.currentStatus}
              </span>
            </div>
          </div>

          {validNextStatuses.length === 0 ? (
            <div className="p-3.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-outline shrink-0 mt-0.5" />
              <span>
                Esta orden ya se encuentra en su estado terminal (<strong>{order.currentStatus}</strong>). No admite más transiciones de estado.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="next-status-select" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Siguiente Estado Permitido <span className="text-error">*</span>
              </label>
              <select
                id="next-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {validNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_NAMES[st] || st}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || validNextStatuses.length === 0 || !selectedStatus}
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Confirmar Cambio'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
