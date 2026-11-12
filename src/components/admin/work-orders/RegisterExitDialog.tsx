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
import { useRegisterOrderExit } from '@/api/admin/work-orders';
import type { DashboardWorkOrder } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface RegisterExitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: DashboardWorkOrder | null;
}

export const RegisterExitDialog: React.FC<RegisterExitDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  const { toast } = useToast();
  const exitMutation = useRegisterOrderExit();

  const [finalState, setFinalState] = useState<string>('Reparado y verificado en óptimas condiciones de funcionamiento');
  const [repairsPerformed, setRepairsPerformed] = useState<string>('');
  const [partsUsed, setPartsUsed] = useState<string>('');
  const [observations, setObservations] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setFinalState('Reparado y verificado en óptimas condiciones de funcionamiento');
      setRepairsPerformed('');
      setPartsUsed('');
      setObservations('');
    }
  }, [isOpen]);

  if (!order) return null;

  const isReadyForDelivery = order.currentStatus === 'LISTO_PARA_ENTREGA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalState.trim() || !repairsPerformed.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Debes especificar el estado final y los trabajos realizados.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await exitMutation.mutateAsync({
        workOrderId: order.id,
        payload: {
          finalState: finalState.trim(),
          repairsPerformed: repairsPerformed.trim(),
          partsUsed: partsUsed.trim() || undefined,
          observations: observations.trim() || undefined,
        },
      });

      toast({
        title: 'Entrega registrada con éxito',
        description: `Se registró la salida del dispositivo de la orden ${order.guideNumber}.`,
      });

      onOpenChange(false);
    } catch (err: any) {
      let errorMessage = 'No se pudo registrar la entrega de la orden.';
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.error?.message || (err.response.data as any)?.message || errorMessage;
      }
      toast({
        title: 'Error de entrega',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = exitMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            Registrar Entrega al Cliente
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-1">
            Acta de entrega final y registro de salida del equipo de la orden {order.guideNumber}.
          </DialogDescription>
        </DialogHeader>

        {!isReadyForDelivery && (
          <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Aviso de flujo:</strong> Para registrar la entrega final, la orden debe estar en estado <strong>LISTO_PARA_ENTREGA</strong> (estado actual: <em>{order.currentStatus}</em>). Puedes actualizar el estado primero antes de registrar la entrega.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label htmlFor="final-state" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Estado Final del Dispositivo <span className="text-error">*</span>
            </label>
            <input
              id="final-state"
              type="text"
              value={finalState}
              onChange={(e) => setFinalState(e.target.value)}
              disabled={isSubmitting || !isReadyForDelivery}
              placeholder="Ej: Operativo, pantalla reparada, probado con cliente"
              className="w-full px-3.5 py-2 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="repairs-performed" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Reparaciones Realizadas <span className="text-error">*</span>
            </label>
            <textarea
              id="repairs-performed"
              rows={2}
              value={repairsPerformed}
              onChange={(e) => setRepairsPerformed(e.target.value)}
              disabled={isSubmitting || !isReadyForDelivery}
              placeholder="Detalla las soluciones técnicas aplicadas al equipo..."
              className="w-full px-3.5 py-2 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="parts-used" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Repuestos Utilizados
            </label>
            <input
              id="parts-used"
              type="text"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              disabled={isSubmitting || !isReadyForDelivery}
              placeholder="Ej: Display FHD Lenovo, Pasta térmica Artic Silver"
              className="w-full px-3.5 py-2 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="observations" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Observaciones de Entrega y Garantía
            </label>
            <textarea
              id="observations"
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={isSubmitting || !isReadyForDelivery}
              placeholder="Condiciones de garantía acordadas con el cliente..."
              className="w-full px-3.5 py-2 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

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
              disabled={isSubmitting || !isReadyForDelivery || !finalState.trim() || !repairsPerformed.trim()}
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Entrega'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
