import React from 'react';
import { Eye, Users } from 'lucide-react';
import type { Customer } from '@/types/customers';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  onView: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  isLoading,
  onView,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">Cliente</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">Teléfono</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-center">Registro</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {isLoading ? (
              // Loading State
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full bg-surface-container shrink-0" />
                      <Skeleton className="h-5 w-40 bg-surface-container" />
                    </div>
                  </td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-48 bg-surface-container" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-32 bg-surface-container" /></td>
                  <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-24 bg-surface-container mx-auto" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-8 w-8 bg-surface-container mx-auto rounded" /></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 text-outline mb-2" />
                    <p className="font-medium text-lg text-on-surface">No se encontraron clientes</p>
                    <p className="text-sm mt-1">Ajusta los filtros o registra un nuevo cliente.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-medium text-sm border border-primary/20 shrink-0">
                        {getInitials(customer.fullName)}
                      </div>
                      <span className="font-body-md font-medium text-on-surface">
                        {customer.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-body-md text-on-surface-variant">
                      {customer.email || <span className="text-outline italic">Sin email</span>}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-body-md text-on-surface-variant">
                      {customer.phone || <span className="text-outline italic">—</span>}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-data-mono text-sm text-on-surface">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onView(customer)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Ver Detalle"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
