import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrackWorkOrder } from '@/api/hooks';
import { 
  Search, 
  Smartphone, 
  Check, 
  Calendar, 
  AlertCircle,
  Wrench,
  Clock,
  Sparkles,
  Package
} from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  time: string;
  completed: boolean;
  current: boolean;
}

const STAGES = [
  { key: 'ACEPTADA', label: 'Recepción del Dispositivo' },
  { key: 'EN_REVISION', label: 'Diagnóstico y Revisión Técnica' },
  { key: 'ESPERANDO_REPUESTO', label: 'En Espera de Repuestos / Insumos' },
  { key: 'EN_REPARACION', label: 'En Proceso de Reparación' },
  { key: 'REPARADO', label: 'Reparación Finalizada' },
  { key: 'LISTO_PARA_ENTREGA', label: 'Listo para Entrega al Cliente' },
  { key: 'ENTREGADO', label: 'Dispositivo Entregado' },
];

export const Tracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGuide = searchParams.get('guia') || '';

  const [inputGuide, setInputGuide] = useState(initialGuide);
  const [activeGuide, setActiveGuide] = useState(initialGuide);

  const { data, isLoading, isFetching, isError } = useTrackWorkOrder(activeGuide);

  useEffect(() => {
    const urlGuide = searchParams.get('guia');
    if (urlGuide && urlGuide !== activeGuide) {
      setInputGuide(urlGuide.toUpperCase());
      setActiveGuide(urlGuide.toUpperCase());
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuide = inputGuide.trim().toUpperCase();
    if (cleanGuide) {
      setActiveGuide(cleanGuide);
      setSearchParams({ guia: cleanGuide });
    }
  };

  const handleQuickSearch = (guide: string) => {
    setInputGuide(guide);
    setActiveGuide(guide);
    setSearchParams({ guia: guide });
  };

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return 'Pendiente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Construir línea de tiempo dinámica según el estado actual y el historial
  const buildTimeline = (): TimelineStep[] => {
    if (!data?.order) return [];

    const currentStatus = data.order.currentStatus;
    const history = data.history || [];

    // Mapeo de estados a índice de progreso
    const statusIndexMap: Record<string, number> = {
      PENDIENTE: 0,
      ACEPTADA: 0,
      INGRESADO: 0,
      EN_REVISION: 1,
      ESPERANDO_REPUESTO: 2,
      EN_REPARACION: 3,
      REPARADO: 4,
      LISTO_PARA_ENTREGA: 5,
      ENTREGADO: 6,
    };

    const currentIndex = statusIndexMap[currentStatus] ?? 0;

    return STAGES.map((stage, idx) => {
      // Buscar timestamp en el historial
      const historyEntry = history.find(
        (h) => h.toStatus === stage.key || (stage.key === 'ACEPTADA' && h.toStatus === 'INGRESADO')
      );

      let timeText = 'Pendiente';
      if (idx === 0) {
        timeText = formatTimestamp(data.order.createdAt);
      } else if (historyEntry) {
        timeText = formatTimestamp(historyEntry.createdAt);
      } else if (idx < currentIndex) {
        timeText = 'Completado';
      } else if (idx === currentIndex) {
        timeText = 'Actualmente en proceso';
      }

      return {
        status: stage.key,
        label: stage.label,
        time: timeText,
        completed: idx < currentIndex || (idx === currentIndex && currentStatus === 'ENTREGADO'),
        current: idx === currentIndex && currentStatus !== 'ENTREGADO',
      };
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
      case 'ACEPTADA':
      case 'INGRESADO':
        return <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">Ingresado</span>;
      case 'EN_REVISION':
        return <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">En Revisión</span>;
      case 'ESPERANDO_REPUESTO':
        return <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase border border-amber-200">Esperando Repuesto</span>;
      case 'EN_REPARACION':
        return <span className="px-3.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase border border-orange-200 flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> En Reparación</span>;
      case 'REPARADO':
        return <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase border border-emerald-200 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Reparado</span>;
      case 'LISTO_PARA_ENTREGA':
        return <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase border border-emerald-300">Listo para Entrega</span>;
      case 'ENTREGADO':
        return <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-300">Entregado</span>;
      default:
        return <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">{status}</span>;
    }
  };

  const timeline = buildTimeline();

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191C1E] tracking-tight mb-2">
            Seguimiento de Reparación
          </h1>
          <p className="text-base text-[#434655]">
            Rastrea el progreso y trazabilidad de tu dispositivo en tiempo real sin necesidad de iniciar sesión.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#737686] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ingresa tu número de guía"
              value={inputGuide}
              onChange={(e) => setInputGuide(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E0E3E5] rounded-xl text-sm font-mono text-[#191C1E] uppercase focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="bg-primary hover:bg-[#003EA8] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors flex-shrink-0 disabled:opacity-60"
          >
            {isFetching ? 'Buscando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {/* Sugerencias Rápidas para Probar */}
      {!activeGuide && (
        <div className="bg-[#F7F9FB] border border-[#E0E3E5] rounded-2xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#191C1E]">¿Tienes una orden en el taller?</p>
              <p className="text-xs text-[#737686]">Ingresa el código que te entregamos en el comprobante físico o prueba con una orden activa:</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['3C7B2778', 'B1391A37', '9C7A06E9'].map((demoCode) => (
              <button
                key={demoCode}
                onClick={() => handleQuickSearch(demoCode)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#E0E3E5] rounded-lg text-xs font-mono font-semibold text-primary transition-colors shadow-2xs"
              >
                {demoCode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerta de Error: Guía no encontrada */}
      {isError && (
        <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 mb-8 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            No se encontró ninguna orden asociada a la guía <strong>{activeGuide}</strong>. Verifica que el código esté bien escrito o consulta directamente con el taller.
          </p>
        </div>
      )}

      {/* Cargando */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#737686] font-medium">Buscando información de tu dispositivo en el taller...</p>
        </div>
      )}

      {/* Detalle de la Orden Real */}
      {data?.order && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Información y Línea de Tiempo (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Tarjeta de Encabezado de la Orden */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#F2F4F6] text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#191C1E]">
                    {data.order.deviceBrand} {data.order.deviceModel}
                  </h2>
                  <p className="text-xs text-[#737686] font-mono mt-0.5">
                    Guía: <strong className="text-primary">{data.order.guideNumber}</strong> • Serial: {data.order.deviceSerial}
                  </p>
                </div>
              </div>

              <div>{getStatusBadge(data.order.currentStatus)}</div>
            </div>

            {/* Tarjeta de Línea de Tiempo */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#191C1E] mb-8 pb-3 border-b border-[#E0E3E5] flex items-center justify-between">
                <span>Historial de Servicio en Taller</span>
                <span className="text-xs font-normal text-[#737686]">Actualizado en tiempo real</span>
              </h3>

              <div className="relative pl-3">
                {/* Línea vertical */}
                <div className="absolute left-[29px] top-4 bottom-6 w-0.5 bg-[#E6E8EA]" />

                {timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 mb-7 last:mb-0">
                    {/* Indicador de Estado */}
                    {step.completed ? (
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow-sm flex-shrink-0">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    ) : step.current ? (
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-primary ring-4 ring-primary/20 flex items-center justify-center z-10 flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#ECEEF0] border-2 border-[#E0E3E5] flex items-center justify-center z-10 flex-shrink-0" />
                    )}

                    {/* Texto del paso */}
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
                      <p className="text-xs text-[#737686] mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Detalles del Diagnóstico y Cita (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6">
              <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-4 border-b border-[#E0E3E5] pb-2">
                Detalles de la Orden
              </h3>

              {/* Falla reportada */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Falla / Síntoma Reportado</p>
                  <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-3 rounded-xl border border-[#E0E3E5]/60 leading-relaxed">
                    {data.order.problemDescription || 'Sin descripción'}
                  </p>
                </div>

                {/* Accesorios */}
                {data.order.accessories && (
                  <div>
                    <p className="text-xs font-bold text-[#191C1E]">Accesorios Recibidos</p>
                    <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-2.5 rounded-xl border border-[#E0E3E5]/60">
                      {data.order.accessories}
                    </p>
                  </div>
                )}

                {/* Fecha de ingreso */}
                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Fecha de Ingreso al Taller</p>
                  <div className="flex items-center gap-2 mt-1 text-slate-700">
                    <Clock className="w-4 h-4 text-[#737686]" />
                    <span className="text-xs">{formatTimestamp(data.order.createdAt)}</span>
                  </div>
                </div>

                {/* Compromiso / Cita */}
                {data.order.scheduledTime && (
                  <div className="pt-3 border-t border-[#E0E3E5]">
                    <p className="text-xs font-bold text-[#191C1E]">Cita / Entrega Estimada</p>
                    <div className="flex items-center gap-2 mt-1.5 text-primary">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">{formatTimestamp(data.order.scheduledTime)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Garantía y Compromiso de Servicio */}
            <div className="bg-linear-to-br from-[#0052D4]/5 to-[#4364F7]/5 rounded-2xl border border-primary/20 p-5">
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
