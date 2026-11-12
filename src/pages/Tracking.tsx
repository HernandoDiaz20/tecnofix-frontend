import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrackWorkOrder } from '@/api/hooks';
import { 
  Search, 
  Smartphone, 
  Check, 
  Calendar, 
  AlertCircle,
  Wrench,
  UserCheck,
  Clock,
  Sparkles,
  Package
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Solicitud Registrada',
  ACEPTADA: 'Orden Aceptada en Taller',
  INGRESADO: 'Orden Recibida',
  EN_REVISION: 'En Revisión y Diagnóstico',
  ESPERANDO_REPUESTO: 'Esperando Repuesto',
  EN_REPARACION: 'En Reparación',
  REPARADO: 'Reparado y Probado',
  LISTO_PARA_ENTREGA: 'Listo para Entrega',
  ENTREGADO: 'Dispositivo Entregado',
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

export const Tracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGuide = searchParams.get('guia') || searchParams.get('guide') || '';

  const [guideInput, setGuideInput] = useState(initialGuide);
  const [searchedGuide, setSearchedGuide] = useState(initialGuide);

  const { data, isLoading, isFetching, isError, refetch } = useTrackWorkOrder(searchedGuide);

  useEffect(() => {
    const urlGuide = searchParams.get('guia') || searchParams.get('guide');
    if (urlGuide && urlGuide.toUpperCase() !== searchedGuide) {
      const upper = urlGuide.toUpperCase();
      setGuideInput(upper);
      setSearchedGuide(upper);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuide = guideInput.trim().toUpperCase();
    if (cleanGuide) {
      setSearchedGuide(cleanGuide);
      setSearchParams({ guia: cleanGuide });
      if (searchedGuide === cleanGuide) {
        refetch();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-300">
            Pendiente
          </span>
        );
      case 'ACEPTADA':
      case 'INGRESADO':
        return (
          <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">
            Aceptada en Taller
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">
            En Revisión
          </span>
        );
      case 'ESPERANDO_REPUESTO':
        return (
          <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase border border-amber-200">
            Esperando Repuesto
          </span>
        );
      case 'EN_REPARACION':
        return (
          <span className="px-3.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase border border-orange-200 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> En Reparación
          </span>
        );
      case 'REPARADO':
        return (
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase border border-emerald-200 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Reparado
          </span>
        );
      case 'LISTO_PARA_ENTREGA':
        return (
          <span className="px-3.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase border border-teal-200">
            Listo para Entrega
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-300">
            Entregado
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  const getStatusSummaryText = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'Tu orden fue ingresada y se encuentra pendiente de confirmación técnica.';
      case 'ACEPTADA':
      case 'INGRESADO':
        return 'Tu orden fue aceptada formalmente en nuestro taller y está en cola para diagnóstico.';
      case 'EN_REVISION':
        return 'Un especialista técnico está revisando y diagnosticando tu dispositivo.';
      case 'ESPERANDO_REPUESTO':
        return 'Se solicitó un repuesto para tu equipo; reanudaremos el trabajo al recibir la pieza.';
      case 'EN_REPARACION':
        return 'El técnico especialista está ejecutando la reparación en el taller.';
      case 'REPARADO':
        return 'Tu dispositivo ha sido reparado con éxito y superó las pruebas de calidad.';
      case 'LISTO_PARA_ENTREGA':
        return 'Tu equipo está listo para entrega. Puedes acercarte a nuestro local a retirarlo.';
      case 'ENTREGADO':
        return 'El equipo ya fue entregado a su propietario. ¡Gracias por confiar en TecnoFix!';
      default:
        return 'Tu orden está en seguimiento.';
    }
  };

  const order = data?.order;
  const history = data?.history || [];

  // Construir los pasos del timeline a partir del estado real y de data.history
  const buildTimelineSteps = () => {
    if (!order) return [];

    const hasPendiente = order.currentStatus === 'PENDIENTE' || history.some(h => h.fromStatus === 'PENDIENTE' || h.toStatus === 'PENDIENTE');
    const hasRepuesto = order.currentStatus === 'ESPERANDO_REPUESTO' || history.some(h => h.toStatus === 'ESPERANDO_REPUESTO');

    const sequence: string[] = [];
    if (hasPendiente) sequence.push('PENDIENTE');
    sequence.push('ACEPTADA');
    sequence.push('EN_REVISION');
    if (hasRepuesto) sequence.push('ESPERANDO_REPUESTO');
    sequence.push('EN_REPARACION');
    sequence.push('REPARADO');
    sequence.push('LISTO_PARA_ENTREGA');
    sequence.push('ENTREGADO');

    const currentIndex = sequence.indexOf(order.currentStatus);

    return sequence.map((statusKey, index) => {
      // Buscar el evento de historial más reciente para este estado
      const historyEntry = [...history]
        .reverse()
        .find(h => 
          h.toStatus === statusKey || 
          (statusKey === 'ACEPTADA' && (h.toStatus === 'INGRESADO' || h.fromStatus === 'INGRESADO' || h.toStatus === 'ACEPTADA'))
        );

      const isCurrent = order.currentStatus === statusKey;
      let isCompleted = false;

      if (!isCurrent) {
        if (currentIndex !== -1 && index < currentIndex) {
          if (statusKey === 'ESPERANDO_REPUESTO') {
            isCompleted = !!historyEntry;
          } else {
            isCompleted = true;
          }
        } else if (order.currentStatus === 'ENTREGADO') {
          isCompleted = true;
        }
      }

      let timeText = 'Pendiente';
      if (historyEntry?.createdAt) {
        timeText = formatDateTime(historyEntry.createdAt);
      } else if (statusKey === 'ACEPTADA' || (statusKey === 'PENDIENTE' && hasPendiente)) {
        timeText = formatDateTime(order.createdAt);
      }

      if (isCurrent && timeText !== 'Pendiente') {
        timeText = `${timeText} • Estado actual`;
      } else if (isCurrent) {
        timeText = 'Actualmente en este estado';
      }

      return {
        status: statusKey,
        label: STATUS_LABELS[statusKey] || statusKey,
        time: timeText,
        completed: isCompleted,
        current: isCurrent,
      };
    });
  };

  const timelineSteps = buildTimelineSteps();

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191C1E] tracking-tight mb-2">
            Seguimiento de Reparación
          </h1>
          <p className="text-base text-[#434655]">
            Rastrea el progreso y la trazabilidad de tu reparación en tiempo real sin necesidad de iniciar sesión.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#737686] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ingresa tu número de guía"
              value={guideInput}
              onChange={(e) => setGuideInput(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E0E3E5] rounded-xl text-sm font-mono text-[#191C1E] uppercase focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching || !guideInput.trim()}
            className="bg-primary hover:bg-[#003EA8] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'Buscando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {/* Alerta de Error: Guía no encontrada */}
      {isError && (
        <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 mb-8 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            No se encontró ninguna orden de servicio asociada a la guía <strong className="font-mono">{searchedGuide}</strong>. Verifica el código o consulta con nuestro personal técnico.
          </p>
        </div>
      )}

      {/* Estado Inicial sin búsqueda */}
      {!searchedGuide && !order && !isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-10 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-[#F2F4F6] text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#191C1E] mb-2">Consulta el estado de tu equipo</h3>
          <p className="text-sm text-[#737686]">
            Ingresa tu número de guía en la barra superior para consultar el historial y el avance en tiempo real de tu dispositivo.
          </p>
        </div>
      )}

      {/* Estado de Carga */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#737686] font-medium">Buscando información de tu dispositivo en el taller...</p>
        </div>
      )}

      {/* Detalle de la Orden Real */}
      {order && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tracker (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Status Banner Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#F2F4F6] text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#191C1E]">
                    {order.deviceBrand} {order.deviceModel}
                  </h2>
                  <p className="text-xs text-[#737686] font-mono mt-0.5">
                    Guía: <strong className="text-primary">{order.guideNumber}</strong> • Serial: {order.deviceSerial || 'No registrado'}
                  </p>
                  {(order as any).customer?.fullName && (
                    <p className="text-xs text-[#434655] font-medium mt-1">
                      Cliente: <span className="text-[#191C1E] font-semibold">{(order as any).customer.fullName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>{getStatusBadge(order.currentStatus)}</div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6 sm:p-8">
              <div className="flex justify-between items-center mb-8 pb-3 border-b border-[#E0E3E5]">
                <h3 className="text-lg font-bold text-[#191C1E] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Historial de Servicio
                </h3>
                <span className="text-xs text-[#737686] font-medium">
                  {history.length} {history.length === 1 ? 'registro' : 'registros'} en bitácora
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center text-[#737686] space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-[#737686]/60" />
                  <p className="text-sm font-semibold text-[#191C1E]">
                    No se registran transiciones en el historial para esta orden todavía.
                  </p>
                  <p className="text-xs text-[#737686]">
                    Estado actual: <strong className="text-primary">{STATUS_LABELS[order.currentStatus] || order.currentStatus}</strong>
                  </p>
                </div>
              ) : (
                <div className="relative pl-3">
                  {/* Vertical Line */}
                  <div className="absolute left-[29px] top-4 bottom-6 w-0.5 bg-[#E6E8EA]" />

                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 mb-7 last:mb-0">
                      {/* Step Circle Indicator */}
                      {step.completed ? (
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-sm flex-shrink-0">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      ) : step.current ? (
                        <div className="w-9 h-9 rounded-full bg-white border-2 border-primary ring-4 ring-primary/20 flex items-center justify-center z-10 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#ECEEF0] border-2 border-[#E0E3E5] flex items-center justify-center z-10 flex-shrink-0" />
                      )}

                      {/* Step Text */}
                      <div className="pt-1.5 flex-1">
                        <p
                          className={`text-sm font-bold ${
                            step.current
                              ? 'text-primary'
                              : step.completed
                              ? 'text-[#191C1E]'
                              : 'text-[#737686]'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${step.current ? 'text-primary font-medium' : 'text-[#737686]'}`}>
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Information (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Technician & Order Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6">
              <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-4 border-b border-[#E0E3E5] pb-2">
                Detalles de la Orden
              </h3>

              {/* Technician Info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-[#F7F9FB] rounded-xl border border-[#E0E3E5]">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#737686]">Técnico Asignado</p>
                  <p className="text-sm font-bold text-[#191C1E]">
                    {(order as any).technician?.fullName || (order.technicianId ? 'Técnico asignado por TecnoFix' : 'Pendiente de asignación')}
                  </p>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Problema / Falla Reportada</p>
                  <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-2.5 rounded-xl border border-[#E0E3E5]/60 leading-relaxed">
                    {order.problemDescription || 'Sin descripción reportada.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Accesorios Recibidos</p>
                  <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-2.5 rounded-xl border border-[#E0E3E5]/60">
                    {order.accessories || 'Ninguno reportado.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Resumen de Avance</p>
                  <p className="text-xs text-primary font-medium mt-1 bg-primary/5 p-2.5 rounded-xl border border-primary/20 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    {getStatusSummaryText(order.currentStatus)}
                  </p>
                </div>
              </div>

              {/* Creation Date */}
              <div className="mt-6 pt-4 border-t border-[#E0E3E5]">
                <p className="text-xs font-bold text-[#191C1E]">Fecha de Ingreso al Taller</p>
                <div className="flex items-center gap-2 mt-1.5 text-primary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">{formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              {/* Scheduled / Appointment Date */}
              {(order as any).scheduledTime && (
                <div className="mt-4 pt-3 border-t border-[#E0E3E5]">
                  <p className="text-xs font-bold text-[#191C1E]">Cita / Entrega Estimada</p>
                  <div className="flex items-center gap-2 mt-1.5 text-primary">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-bold">{formatDateTime((order as any).scheduledTime)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Servicio Técnico Garantizado */}
            <div className="bg-gradient-to-br from-[#0052D4]/5 to-[#4364F7]/5 rounded-2xl border border-primary/20 p-5">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Servicio Técnico Garantizado</p>
                  <p className="text-xs text-[#434655] mt-1 leading-relaxed">
                    Toda reparación incluye garantía en repuestos originales y mano de obra calificada. Consulta tus documentos al retirar el equipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
