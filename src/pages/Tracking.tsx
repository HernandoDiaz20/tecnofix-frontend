import { useState } from 'react';
import { useTrackWorkOrder } from '@/api/hooks';
import { 
  Search, 
  Smartphone, 
  Check, 
  Calendar, 
  AlertCircle,
  Wrench,
  UserCheck
} from 'lucide-react';

export const Tracking = () => {
  const [guideNumber, setGuideNumber] = useState('TF-000245');
  const [searched, setSearched] = useState(true); // Default true to display example immediately
  
  const { data, refetch, isFetching, isError } = useTrackWorkOrder(guideNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (guideNumber.trim()) {
      setSearched(true);
      refetch();
    }
  };

  // Mock / example data matching Stitch screen
  const defaultOrder = {
    guideNumber: guideNumber || 'TF-000245',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13',
    deviceSerial: 'F2LZN987Q1',
    problemDescription: 'Pantalla astillada y el táctil no responde en la zona inferior tras una caída.',
    diagnosis: 'Se requiere cambio de módulo de pantalla completo. Componentes internos sin daño líquido aparente.',
    partsUsed: 'Módulo Pantalla Original (OEM) iPhone 13 - Adhesivo de sellado contra agua.',
    technicianName: 'Carlos M. - Especialista Senior',
    estimatedDelivery: '23 Ago, 2024 - 17:00 HRS',
    currentStatus: 'EN_REPARACION',
    createdAt: '2024-08-21T09:30:00.000Z',
    receptionPhotos: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
    ],
    timeline: [
      { status: 'INGRESADO', label: 'Ingresado', time: '21 Ago, 9:30 AM', completed: true },
      { status: 'EN_REVISION', label: 'En revisión', time: '21 Ago, 11:15 AM', completed: true },
      { status: 'DIAGNOSTICADO', label: 'Diagnóstico realizado', time: '21 Ago, 2:30 PM', completed: true },
      { status: 'ESPERANDO_REPUESTO', label: 'Esperando repuesto', time: '21 Ago, 3:00 PM', completed: true },
      { status: 'EN_REPARACION', label: 'En reparación', time: 'Actualmente en proceso', current: true },
      { status: 'REPARADO', label: 'Reparado', time: 'Pendiente' },
      { status: 'LISTO_PARA_ENTREGA', label: 'Listo para entrega', time: 'Pendiente' },
      { status: 'ENTREGADO', label: 'Entregado', time: 'Pendiente' },
    ]
  };

  const order = data?.order ? {
    guideNumber: data.order.guideNumber,
    deviceBrand: data.order.deviceBrand,
    deviceModel: data.order.deviceModel,
    deviceSerial: data.order.deviceSerial,
    problemDescription: data.order.problemDescription,
    diagnosis: 'Diagnóstico técnico realizado y en proceso de solución.',
    partsUsed: 'Repuestos originales garantizados.',
    technicianName: 'Técnico Especialista TecnoFix',
    estimatedDelivery: '24-48 Horas hábiles',
    currentStatus: data.order.currentStatus,
    createdAt: data.order.createdAt,
    receptionPhotos: defaultOrder.receptionPhotos,
    timeline: defaultOrder.timeline
  } : defaultOrder;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INGRESADO':
        return <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">Ingresado</span>;
      case 'EN_REVISION':
        return <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">En Revisión</span>;
      case 'ESPERANDO_REPUESTO':
        return <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase border border-amber-200">Esperando Repuesto</span>;
      case 'EN_REPARACION':
        return <span className="px-3.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase border border-orange-200 flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> En Reparación</span>;
      case 'REPARADO':
      case 'LISTO_PARA_ENTREGA':
        return <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase border border-emerald-200">Listo para Entrega</span>;
      case 'ENTREGADO':
        return <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-300">Entregado</span>;
      default:
        return <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191C1E] tracking-tight mb-2">
            Estado de tu Dispositivo
          </h1>
          <p className="text-base text-[#434655]">
            Rastrea el progreso y trazabilidad de tu reparación en tiempo real sin necesidad de iniciar sesión.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#737686] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ingresa tu número de orden"
              value={guideNumber}
              onChange={(e) => setGuideNumber(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E0E3E5] rounded-xl text-sm font-mono text-[#191C1E] uppercase focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="bg-primary hover:bg-[#003EA8] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors flex-shrink-0"
          >
            {isFetching ? 'Buscando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {isError && (
        <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 mb-8 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            No se encontró ninguna orden asociada a la guía <strong>{guideNumber}</strong>. Revisa el código o consulta con soporte.
          </p>
        </div>
      )}

      {searched && (
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
                    Guía: {order.guideNumber} • Serial: {order.deviceSerial}
                  </p>
                </div>
              </div>

              <div>{getStatusBadge(order.currentStatus)}</div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#191C1E] mb-8 pb-3 border-b border-[#E0E3E5]">
                Historial de Servicio
              </h3>

              <div className="relative pl-3">
                {/* Vertical Line */}
                <div className="absolute left-[29px] top-4 bottom-6 w-0.5 bg-[#E6E8EA]" />

                {order.timeline.map((step, idx) => (
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
                      <p className="text-xs text-[#737686] mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Photos (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Technician & Order Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6">
              <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-4 border-b border-[#E0E3E5] pb-2">
                Detalles de la Orden
              </h3>

              {/* Technician Info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-[#F7F9FB] rounded-xl border border-[#E0E3E5]">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#737686]">Técnico Asignado</p>
                  <p className="text-sm font-bold text-[#191C1E]">{order.technicianName}</p>
                </div>
              </div>

              {/* Diagnosis breakdown */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Problema Reportado</p>
                  <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-2.5 rounded-xl border border-[#E0E3E5]/60">
                    {order.problemDescription}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Diagnóstico Oficial</p>
                  <p className="text-xs text-[#434655] mt-1 bg-[#F7F9FB] p-2.5 rounded-xl border border-[#E0E3E5]/60">
                    {order.diagnosis}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#191C1E]">Repuestos Utilizados</p>
                  <p className="text-xs text-[#434655] mt-1">{order.partsUsed}</p>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 pt-4 border-t border-[#E0E3E5]">
                <p className="text-xs font-bold text-[#191C1E]">Fecha Estimada de Entrega</p>
                <div className="flex items-center gap-2 mt-1.5 text-primary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">{order.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E3E5] p-6">
              <h3 className="text-xs font-bold text-[#434655] uppercase tracking-wider mb-4 border-b border-[#E0E3E5] pb-2">
                Estado de Recepción
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {order.receptionPhotos.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden border border-[#E0E3E5] relative group"
                  >
                    <img
                      src={img}
                      alt={`Foto recepción ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#737686] mt-3 text-center">
                Fotografías tomadas al ingresar el dispositivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
