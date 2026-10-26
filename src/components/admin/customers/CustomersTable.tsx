import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/types/customers';

interface CustomersTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
}) => {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-on-primary-container text-2xl">
            group_off
          </span>
        </div>
        <h3 className="text-lg font-semibold text-on-surface mb-2">No hay clientes registrados</h3>
        <p className="text-on-surface-variant text-center max-w-md">
          Aún no se han registrado clientes en el sistema. Registra un cliente para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant">
              <th className="px-4 py-3 font-semibold text-sm text-on-surface uppercase tracking-wider">Nombre Completo</th>
              <th className="px-4 py-3 font-semibold text-sm text-on-surface uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 font-semibold text-sm text-on-surface uppercase tracking-wider">Teléfono</th>
              <th className="px-4 py-3 font-semibold text-sm text-on-surface uppercase tracking-wider">Fecha de registro</th>
              <th className="px-4 py-3 font-semibold text-sm text-on-surface uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {customers.map((customer) => (
              <tr 
                key={customer.id}
                className="hover:bg-surface-container-lowest transition-colors group"
              >
                <td className="px-4 py-4 font-medium text-on-surface">
                  {customer.fullName}
                </td>
                <td className="px-4 py-4 text-on-surface-variant text-sm">
                  {customer.email || <span className="text-outline italic">Sin email</span>}
                </td>
                <td className="px-4 py-4 text-on-surface-variant text-sm">
                  {customer.phone || <span className="text-outline italic">Sin teléfono</span>}
                </td>
                <td className="px-4 py-4 text-on-surface-variant text-sm">
                  {format(new Date(customer.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(customer)}
                      className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary-container/50"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(customer)}
                      className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary-container/50"
                      title="Editar cliente"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(customer)}
                      className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error-container/50"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
