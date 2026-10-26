import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Mail, Phone, Calendar, ClipboardList } from 'lucide-react';
import type { Customer } from '@/types/customers';
import { useCustomerWorkOrders } from '@/api/admin/customer-hooks';
import { Badge } from '@/components/ui/badge';

interface CustomerDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  isOpen,
  onOpenChange,
  customer,
}) => {
  const { data: workOrdersData, isLoading: isLoadingOrders } = useCustomerWorkOrders(
    isOpen && customer ? customer.id : ''
  );

  if (!customer) return null;

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'EN_PROGRESO':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Progreso</Badge>;
      case 'COMPLETADO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>;
      case 'CANCELADO':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detalle del Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                Nombre Completo
              </span>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="font-medium">{customer.fullName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                Fecha de Registro
              </span>
              <div className="flex items-center gap-2 text-on-surface">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{format(new Date(customer.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                Email
              </span>
              <div className="flex items-center gap-2 text-on-surface">
                <Mail className="w-4 h-4 text-primary" />
                <span>{customer.email || <span className="text-outline italic">No registrado</span>}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                Teléfono
              </span>
              <div className="flex items-center gap-2 text-on-surface">
                <Phone className="w-4 h-4 text-primary" />
                <span>{customer.phone || <span className="text-outline italic">No registrado</span>}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-6">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-on-surface">
              <ClipboardList className="w-4 h-4 text-primary" />
              Órdenes de Servicio
            </h4>

            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-6 text-on-surface-variant">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : workOrdersData?.items && workOrdersData.items.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {workOrdersData.items.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest"
                  >
                    <div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                        N° de Guía
                      </div>
                      <div className="font-mono font-medium text-sm text-on-surface">
                        {order.guide_number}
                      </div>
                    </div>
                    <div>
                      {renderStatus(order.current_status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-outline-variant rounded-lg bg-surface-container-lowest">
                <p className="text-sm text-on-surface-variant">
                  El cliente no tiene órdenes de servicio registradas.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
