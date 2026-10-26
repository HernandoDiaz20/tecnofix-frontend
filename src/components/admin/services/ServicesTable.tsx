import React from 'react';
import { Wrench, Edit2, CheckCircle2, Ban } from 'lucide-react';
import type { Service } from '@/types/services';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductStatusBadge } from '../products/ProductStatusBadge';

interface ServicesTableProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDeactivate: (service: Service) => void;
  onActivate: (service: Service) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  isLoading,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">
                Servicio
              </th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">
                Descripción
              </th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">
                Precio
              </th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-secondary-fixed-variant uppercase tracking-wider text-center w-32">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-lg bg-surface-container shrink-0" />
                      <Skeleton className="h-5 w-48 bg-surface-container" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-4 w-64 bg-surface-container" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-5 w-24 bg-surface-container" />
                  </td>
                  <td className="py-3.5 px-4">
                    <Skeleton className="h-5 w-16 rounded-full bg-surface-container" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Skeleton className="h-8 w-20 bg-surface-container mx-auto rounded" />
                  </td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <Wrench className="w-12 h-12 text-outline mb-2" />
                    <p className="font-medium text-lg text-on-surface">No se encontraron servicios</p>
                    <p className="text-sm mt-1 text-on-surface-variant">
                      Registra un nuevo servicio para comenzar a ofrecerlo en el catálogo.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr 
                  key={service.id} 
                  className={`hover:bg-surface-container-lowest transition-colors group ${
                    !service.active ? 'opacity-70 bg-surface-container-low/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <span className={`font-medium text-on-surface ${!service.active ? 'text-on-surface-variant' : ''}`}>
                        {service.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {service.description?.trim() ? (
                        service.description
                      ) : (
                        <span className="text-outline italic">Sin descripción</span>
                      )}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-primary">
                      ${Number(service.price).toLocaleString('es-CO')} COP
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <ProductStatusBadge active={service.active} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => onEdit(service)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar servicio"
                        aria-label={`Editar ${service.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {service.active ? (
                        <button
                          onClick={() => onDeactivate(service)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Desactivar servicio"
                          aria-label={`Desactivar ${service.name}`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(service)}
                          className="p-1.5 text-on-surface-variant hover:text-success hover:bg-success-container/50 rounded-lg transition-colors"
                          title="Activar servicio"
                          aria-label={`Activar ${service.name}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
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
