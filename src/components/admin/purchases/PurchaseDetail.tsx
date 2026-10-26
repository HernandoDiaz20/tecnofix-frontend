import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PurchaseStatusBadge } from './PurchaseStatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, Truck, Calendar, User } from 'lucide-react';
import { useAdminPurchaseDetail } from '@/api/admin/purchase-hooks';

interface PurchaseDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId?: string;
}

export const PurchaseDetail: React.FC<PurchaseDetailProps> = ({
  isOpen,
  onOpenChange,
  purchaseId,
}) => {
  const { data: purchase, isLoading } = useAdminPurchaseDetail(purchaseId || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                Detalle de Compra
                {purchase && <PurchaseStatusBadge status={purchase.status} />}
              </DialogTitle>
              <DialogDescription className="text-on-surface-variant pt-2 font-data-mono text-sm">
                ID: {purchaseId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading || !purchase ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm">Cargando detalles de compra...</p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {/* Información General */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex gap-3">
                <Calendar className="w-5 h-5 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha de Solicitud</p>
                  <p className="font-body-md text-on-surface font-medium mt-1">
                    {format(new Date(purchase.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex gap-3">
                <Truck className="w-5 h-5 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Proveedor</p>
                  <p className="font-body-md text-on-surface font-medium mt-1 truncate">
                    {purchase.supplierId || 'Sin proveedor asignado'}
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex gap-3">
                <Package className="w-5 h-5 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Artículos</p>
                  <p className="font-data-mono text-on-surface font-medium mt-1">
                    {purchase.totalItems} unidades
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex gap-3">
                <User className="w-5 h-5 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Creado por</p>
                  <p className="font-data-mono text-on-surface font-medium mt-1 truncate">
                    {purchase.createdBy || 'Sistema'}
                  </p>
                </div>
              </div>
            </div>

            {/* Artículos de la compra */}
            <div>
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-outline-variant pb-2 mb-4">
                Artículos Solicitados
              </h4>
              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-4 py-2 font-medium text-on-surface-variant">Tipo / ID</th>
                      <th className="px-4 py-2 font-medium text-on-surface-variant text-right">Cant.</th>
                      <th className="px-4 py-2 font-medium text-on-surface-variant text-right">Costo Unit.</th>
                      <th className="px-4 py-2 font-medium text-on-surface-variant text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {purchase.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-lowest/50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">
                              {item.productId ? 'Producto' : item.partId ? 'Repuesto' : 'Desconocido'}
                            </span>
                            <span className="text-xs text-on-surface-variant font-data-mono truncate max-w-[200px]" title={item.productId || item.partId || ''}>
                              {item.productId || item.partId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-data-mono font-medium text-on-surface">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-data-mono text-on-surface-variant">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-data-mono font-medium text-on-surface">
                          ${item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-container-lowest border-t-2 border-outline-variant">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-on-surface">
                        Total de la Compra
                      </td>
                      <td className="px-4 py-3 text-right font-data-mono font-bold text-primary text-lg">
                        ${purchase.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notas Adicionales */}
            {purchase.notes && (
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-2">Notas Adicionales</h4>
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{purchase.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
