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
import { Loader2, Package } from 'lucide-react';
import { useAdminParts } from '@/api/admin/part-hooks';
import { useAssignPartToWorkOrder } from '@/api/admin/part-hooks';
import type { DashboardWorkOrder } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: DashboardWorkOrder | null;
}

export const AddPartDialog: React.FC<AddPartDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  const { toast } = useToast();
  const { data: partsData, isLoading: loadingParts } = useAdminParts(1, 100);
  const assignPartMutation = useAssignPartToWorkOrder();

  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const parts = partsData?.items || [];
  const selectedPart = parts.find((p) => p.id === selectedPartId);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedPartId('');
      setQuantity(1);
    }
  }, [isOpen]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartId) {
      toast({
        title: 'Repuesto requerido',
        description: 'Debes seleccionar un repuesto del inventario.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: 'Cantidad inválida',
        description: 'La cantidad debe ser mayor a 0.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPart && quantity > selectedPart.stock) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${selectedPart.stock} unidades disponibles en inventario.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await assignPartMutation.mutateAsync({
        workOrderId: order.id,
        partId: selectedPartId,
        quantity,
      });

      toast({
        title: 'Repuesto asignado',
        description: `Se agregaron ${quantity} unidad(es) de ${selectedPart?.name || 'repuesto'} a la orden ${order.guideNumber}.`,
      });

      onOpenChange(false);
    } catch (err: any) {
      let errorMessage = 'No se pudo asignar el repuesto a la orden.';
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

  const isSubmitting = assignPartMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Agregar Repuesto a la Orden
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-1">
            Asigna piezas o repuestos del inventario para la reparación de la orden {order.guideNumber}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Selector de repuesto */}
          <div className="space-y-2">
            <label htmlFor="part-select" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Repuesto / Pieza <span className="text-error">*</span>
            </label>
            {loadingParts ? (
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span>Cargando inventario de repuestos...</span>
              </div>
            ) : parts.length === 0 ? (
              <div className="p-3.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-outline" />
                <span>No hay repuestos registrados en el inventario.</span>
              </div>
            ) : (
              <select
                id="part-select"
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Selecciona un repuesto --</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} ({p.sku}) — Stock: {p.stock} — ${Number(p.salePrice).toLocaleString('es-CO')} {p.stock <= 0 ? '[Agotado]' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Cantidad */}
          {selectedPart && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="part-quantity" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Cantidad a Usar <span className="text-error">*</span>
                </label>
                <span className="text-xs text-on-surface-variant">
                  Stock disponible: <strong className="text-primary">{selectedPart.stock}</strong>
                </span>
              </div>
              <input
                id="part-quantity"
                type="number"
                min={1}
                max={selectedPart.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-on-surface-variant">
                Subtotal estimado: <strong>${(Number(selectedPart.salePrice) * quantity).toLocaleString('es-CO')}</strong>
              </p>
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
              disabled={isSubmitting || !selectedPartId || (selectedPart && selectedPart.stock <= 0)}
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar Repuesto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
