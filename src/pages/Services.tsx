import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Calendar,
  Wrench,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useServices } from '@/api/hooks';
import type { Service } from '@/types/services';
import { Skeleton } from '@/components/ui/skeleton';

export const Services = () => {
  const { data, isLoading, isError, error, refetch } = useServices();

  const services: Service[] = Array.isArray(data) 
    ? data 
    : ((data as any)?.items || []);

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Servicios de Laboratorio Especializado
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#191C1E] tracking-tight mb-4">
          Servicios Técnicos Especializados
        </h1>
        <p className="text-base sm:text-lg text-[#434655]">
          Diagnóstico y reparación de alta precisión para smartphones, tablets y ordenadores con repuestos de calidad y garantía técnica certificada.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <Skeleton className="w-14 h-14 rounded-2xl bg-slate-100" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-3 bg-slate-100" />
                <Skeleton className="h-4 w-full mb-2 bg-slate-100" />
                <Skeleton className="h-4 w-5/6 mb-6 bg-slate-100" />
              </div>

              <div>
                <div className="pt-4 border-t border-[#E0E3E5] mb-5">
                  <Skeleton className="h-3 w-20 mb-2 bg-slate-100" />
                  <Skeleton className="h-7 w-32 bg-slate-100" />
                </div>
                <Skeleton className="h-11 w-full rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-white rounded-2xl border border-red-200 p-10 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#191C1E] mb-2">
            No se pudieron cargar los servicios
          </h2>
          <p className="text-sm text-[#434655] mb-6">
            {(error as any)?.message || 'Ocurrió un error al conectar con el catálogo de servicios. Por favor, intenta nuevamente.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && services.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E0E3E5] p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#191C1E] mb-2">
            No hay servicios disponibles
          </h2>
          <p className="text-sm sm:text-base text-[#434655] mb-6">
            Actualmente no contamos con servicios activos en el catálogo público. Por favor, consulta más tarde o contáctanos directamente para asistencia técnica.
          </p>
          <Link
            to="/agendar"
            className="inline-flex items-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Agendar Consulta
          </Link>
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && !isError && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-7 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Wrench className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#191C1E] mb-2.5">
                  {service.name}
                </h3>
                <p className="text-sm text-[#434655] leading-relaxed mb-6">
                  {service.description?.trim()
                    ? service.description
                    : 'Servicio técnico especializado con componentes de alta calidad y garantía escrita.'}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-[#E0E3E5] mb-5">
                  <p className="text-xs text-[#737686]">Precio estimado</p>
                  <p className="text-xl font-black text-primary">
                    ${Number(service.price).toLocaleString('es-CO')} COP
                  </p>
                </div>

                <Link
                  to="/agendar"
                  state={{ serviceId: service.id }}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#003EA8] text-white text-sm font-bold py-3 rounded-xl shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar este Servicio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
