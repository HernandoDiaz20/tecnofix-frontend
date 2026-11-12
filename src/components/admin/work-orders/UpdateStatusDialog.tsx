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
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTransitionOrderStatus } from '@/api/work-orders';
import type { DashboardWorkOrder } from '@/types/dashboard';
import type { OrderStatus, ApiError } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

// Máquina de estados oficial del backend (STATUS_TRANSITIONS)
const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDIENTE: ['ACEPTADA'],
  ACEPTADA: ['EN_REVISION'],
  EN_REVISION: ['ESPERANDO_REPUESTO', 'EN_REPARACION'],
  ESPERANDO_REPUESTO: ['EN_REPARACION'],
  EN_REPARACION: ['REPARADO'],
  REPARADO: ['LISTO_PARA_ENTREGA'],
  LISTO_PARA_ENTREGA: ['ENTREGADO'],
  ENTREGADO: [],
};

const STATUS_METADATA: Record<string, { label: string; description: string; badgeClass: string; icon: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    description: 'Solicitud en espera de confirmación',
    badgeClass: 'bg-surface-container-highest text-on-surface border-outline-variant',
    icon: 'hourglass_empty',
  },
  ACEPTADA: {
    label: 'Aceptada',
    description: 'Orden confirmada en el taller y lista para revisión técnica',
    badgeClass: 'bg-primary-container text-on-primary-container border-primary/20',
    icon: 'task_alt',
  },
  EN_REVISION: {
    label: 'En Revisión',
    description: 'Evaluación y diagnóstico técnico en progreso',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: 'search',
  },
  ESPERANDO_REPUESTO: {
    label: 'Esperando Repuesto',
    description: 'Aguardando partes o repuestos solicitados',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: 'inventory_2',
  },
  EN_REPARACION: {
    label: 'En Reparación',
    description: 'Técnico realizando la reparación del dispositivo',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    icon: 'build',
  },
  REPARADO: {
    label: 'Reparado',
    description: 'Reparación culminada y pruebas finalizadas',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: 'check_circle',
  },
  LISTO_PARA_ENTREGA: {
    label: 'Listo para Entrega',
    description: 'Dispositivo listo en recepción para entrega al cliente',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    icon: 'local_shipping',
  },
  ENTREGADO: {
    label: 'Entregado',
    description: 'Dispositivo entregado exitosamente al cliente',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    icon: 'done_all',
  },
};

interface UpdateStatusFormProps {
  order: DashboardWorkOrder;
  onClose: () => void;
}

const UpdateStatusForm: React.FC<UpdateStatusFormProps> = ({ order, onClose }) => {
  const { toast } = useToast();
  const transitionMutation = useTransitionOrderStatus();

  const currentStatus = order.currentStatus || '';
  const allowedTransitions = (currentStatus ? STATUS_TRANSITIONS[currentStatus] : []) || [];
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(
    allowedTransitions.length > 0 ? allowedTransitions[0] : ''
  );

  const currentMeta = STATUS_METADATA[currentStatus] || {
    label: currentStatus,
    description: 'Estado actual',
    badgeClass: 'bg-surface-container text-on-surface',
    icon: 'info',
  };

  const isSubmitting = transitionMutation.isPending;
  const isFinalState = allowedTransitions.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStatus) {
      toast({
        title: 'Selección requerida',
        description: 'Debes seleccionar el siguiente estado para continuar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        id: order.id,
        data: { toStatus: selectedStatus },
      });

      const nextMeta = STATUS_METADATA[selectedStatus];
      toast({
        title: 'Estado actualizado con éxito',
        description: `La orden ${order.guideNumber} pasó al estado "${nextMeta?.label || selectedStatus}".`,
      });

      onClose();
    } catch (err: any) {
      let errorMessage = 'No se pudo actualizar el estado de la orden de servicio.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error al cambiar estado',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-3">
      {/* Resumen del estado actual */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 space-y-1.5">
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
          Estado Actual
        </span>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentMeta.badgeClass}`}>
            <span className="material-symbols-outlined text-sm">{currentMeta.icon}</span>
            {currentMeta.label}
          </span>
          <span className="text-xs text-on-surface-variant italic">
            {currentMeta.description}
          </span>
        </div>
      </div>

      {/* Selector de nuevo estado */}
      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-on-surface block">
          Siguiente estado permitido:
        </label>

        {isFinalState ? (
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/60 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm font-semibold text-on-surface">
              Esta orden se encuentra en estado final ({currentMeta.label}).
            </p>
            <p className="text-xs text-on-surface-variant">
              No existen transiciones posteriores permitidas según el flujo del sistema.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allowedTransitions.map((statusKey) => {
              const meta = STATUS_METADATA[statusKey] || {
                label: statusKey,
                description: '',
                badgeClass: '',
                icon: 'arrow_forward',
              };
              const isSelected = selectedStatus === statusKey;

              return (
                <label
                  key={statusKey}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-outline-variant bg-surface hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="nextStatus"
                    value={statusKey}
                    checked={isSelected}
                    onChange={() => setSelectedStatus(statusKey)}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-primary">
                          {meta.icon}
                        </span>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {meta.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 border-t border-outline-variant/40">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>

        {!isFinalState && (
          <Button
            type="submit"
            disabled={isSubmitting || !selectedStatus}
            className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Confirmar Cambio</span>
              </>
            )}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
};

interface UpdateStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: DashboardWorkOrder | null;
}

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-surface border border-outline-variant p-6 rounded-2xl shadow-xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-2xl">sync</span>
            <span className="text-xs font-bold uppercase tracking-wider">Flujo de Servicio</span>
          </div>
          <DialogTitle className="text-xl font-bold text-on-surface">
            Actualizar Estado de la Orden
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant text-sm">
            Orden <span className="font-semibold text-on-surface">{order.guideNumber}</span> • {order.deviceBrand} {order.deviceModel}
          </DialogDescription>
        </DialogHeader>

        <UpdateStatusForm
          key={`${order.id}-${order.currentStatus}`}
          order={order}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
