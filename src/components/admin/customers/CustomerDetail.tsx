import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, ClipboardList, Loader2 } from 'lucide-react';
import type { Customer } from '@/types/customers';
import { useAdminCustomer, useCustomerWorkOrders } from '@/api/admin/customer-hooks';

interface CustomerDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  isOpen,
  onOpenChange,
  customer,
}) => {
  // If we just use the list prop it's ok, but requirements say "ver detalle" endpoint.
  // We fetch detailed info just in case backend adds more fields later.
  const { data: customerDetails, isLoading: isLoadingCustomer } = useAdminCustomer(customer?.id || '');
  const { data: workOrdersData, isLoading: isLoadingWorkOrders } = useCustomerWorkOrders(customer?.id || '');

  const displayCustomer = customerDetails || customer;

  if (!displayCustomer) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENTREGADO': return 'bg-success/10 text-success border-success/20';
      case 'LISTO_PARA_ENTREGA': return 'bg-primary/10 text-primary border-primary/20';
      case 'EN_REPARACION': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'ESPERANDO_REPUESTO': return 'bg-error/10 text-error border-error/20';
      case 'EN_REVISION': return 'bg-warning/10 text-warning-dark border-warning/20';
      case 'INGRESADO': return 'bg-surface-container-high text-on-surface border-outline-variant';
      default: return 'bg-surface-container text-on-surface border-outline-variant';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="bg-surface-container-low p-6 border-b border-outline-variant flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full border border-primary/20 flex items-center justify-center shrink-0 text-xl font-medium">
            {getInitials(displayCustomer.fullName)}
          </div>
          <div className="flex-1 mt-2">
            <DialogTitle className="text-xl font-semibold text-on-surface">
              {displayCustomer.fullName}
            </DialogTitle>
            <p className="text-sm text-on-surface-variant font-data-mono mt-1 text-[11px] uppercase tracking-wider">
              ID: {displayCustomer.id.substring(0, 8)}...
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {isLoadingCustomer ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                  <Mail className="w-4 h-4" /> Email
                </div>
                <p className="text-on-surface text-sm font-medium break-words">
                  {displayCustomer.email || <span className="text-outline italic">No registrado</span>}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                  <Phone className="w-4 h-4" /> Teléfono
                </div>
                <p className="text-on-surface text-sm font-medium">
                  {displayCustomer.phone || <span className="text-outline italic">No registrado</span>}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                  <Calendar className="w-4 h-4" /> Registro
                </div>
                <p className="text-on-surface text-sm font-medium">
                  {new Date(displayCustomer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              Órdenes de Servicio Asociadas
            </h4>

            <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest">
              {isLoadingWorkOrders ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-on-surface-variant">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
                  <p className="text-sm">Cargando órdenes...</p>
                </div>
              ) : !workOrdersData?.items || workOrdersData.items.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-on-surface-variant">
                  <ClipboardList className="w-8 h-8 text-outline mb-2" />
                  <p className="text-sm font-medium">Este cliente no tiene órdenes de servicio.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-2.5 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">No. Orden</th>
                      <th className="py-2.5 px-4 font-label-md text-xs text-on-surface-variant uppercase tracking-wider text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {workOrdersData.items.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="font-data-mono font-medium text-primary text-sm">
                            {order.guide_number}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.current_status)}`}>
                            {formatStatus(order.current_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 border-t border-outline-variant flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-on-surface-variant"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
