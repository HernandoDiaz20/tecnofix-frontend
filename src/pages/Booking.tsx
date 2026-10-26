import { useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useServices, useCreateAppointment } from '@/api/hooks';
import { bookingSchema, type BookingFormValues } from '@/schemas/booking.schema';
import type { Service } from '@/types/services';
import { 
  CheckCircle,
  Clock,
  ChevronDown,
  Wrench,
  Sparkles,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Booking = () => {
  const location = useLocation();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { data: rawServicesData, isLoading: loadingServices, isError: servicesError } = useServices();

  const apiServices: Service[] = useMemo(() => {
    if (Array.isArray(rawServicesData)) return rawServicesData;
    return (rawServicesData as any)?.items || (rawServicesData as any)?.services || [];
  }, [rawServicesData]);

  // Only active services can be scheduled
  const activeServices = useMemo(() => {
    return apiServices.filter((s) => s.active !== false);
  }, [apiServices]);

  const {
    mutate: createAppointment,
    isPending,
    isSuccess,
    isError,
    error,
    reset: resetMutation,
  } = useCreateAppointment();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      deviceType: 'smartphone',
      brand: '',
      model: '',
      serviceId: '',
      description: '',
      date: todayStr,
      timeSlot: 'morning',
      customerName: '',
      email: '',
      phone: '',
    },
  });

  const selectedServiceId = form.watch('serviceId');

  // Sync serviceId from location.state or fallback to first available active service
  useEffect(() => {
    const passedServiceId = (location.state as any)?.serviceId;
    if (passedServiceId) {
      form.setValue('serviceId', passedServiceId);
      document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeServices.length > 0 && !form.getValues('serviceId')) {
      form.setValue('serviceId', activeServices[0].id);
    }
  }, [location.state, activeServices, form]);

  const handleQuickSelect = (serviceId: string) => {
    form.setValue('serviceId', serviceId);
    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    resetMutation();
    form.reset({
      deviceType: 'smartphone',
      brand: '',
      model: '',
      serviceId: activeServices[0]?.id || '',
      description: '',
      date: todayStr,
      timeSlot: 'morning',
      customerName: '',
      email: '',
      phone: '',
    });
  };

  const onSubmit = (values: BookingFormValues) => {
    const time = values.timeSlot === 'afternoon' ? '14:00:00' : '09:00:00';
    const appointmentDate = new Date(`${values.date}T${time}`).toISOString();

    createAppointment({
      serviceId: values.serviceId,
      customerName: values.customerName.trim(),
      phone: values.phone.trim(),
      date: appointmentDate,
      deviceBrand: values.brand?.trim(),
      deviceModel: values.model?.trim(),
      problemDescription: values.description?.trim(),
    });
  };

  // Helper for formatting error messages from backend
  const getErrorMessage = () => {
    const errData = (error as any)?.response?.data;
    if (errData?.error?.details?.fieldErrors) {
      const fieldErrors = errData.error.details.fieldErrors;
      const messages = Object.entries(fieldErrors).map(
        ([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`
      );
      return `${errData.error.message || 'Error de validación'}: ${messages.join(' | ')}`;
    }
    return (
      errData?.error?.message ||
      (error as any)?.message ||
      'Hubo un problema al procesar la cita. Por favor intenta de nuevo.'
    );
  };

  const selectedService = activeServices.find((s) => s.id === selectedServiceId);

  if (isSuccess) {
    const bookedDateStr = form.getValues('date');
    const timeSlotStr = form.getValues('timeSlot') === 'afternoon' ? 'Tarde (1:00 PM - 5:00 PM)' : 'Mañana (8:00 AM - 12:00 PM)';
    let formattedDate = bookedDateStr;
    try {
      formattedDate = format(new Date(`${bookedDateStr}T12:00:00`), "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch {
      // fallback
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E0E3E5] p-10 md:p-14">
          <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#191C1E] mb-3">
            ¡Cita Agendada con Éxito!
          </h2>
          <p className="text-base text-[#434655] mb-6">
            Hemos registrado tu solicitud para el{' '}
            <strong className="text-[#191C1E] capitalize">{formattedDate}</strong> en jornada{' '}
            <strong className="text-[#191C1E]">{timeSlotStr}</strong>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Cliente:</span>
              <span className="text-[#191C1E] font-semibold">{form.getValues('customerName')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Teléfono:</span>
              <span className="text-[#191C1E] font-semibold">{form.getValues('phone')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Servicio:</span>
              <span className="text-primary font-semibold">{selectedService?.name || 'Servicio Técnico'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Equipo:</span>
              <span className="text-[#191C1E] font-medium capitalize">
                {form.getValues('brand')} {form.getValues('model')} ({form.getValues('deviceType')})
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-8 max-w-md mx-auto">
            Un asesor del equipo técnico de TecnoFix se comunicará contigo vía WhatsApp o llamada para confirmar la recepción en laboratorio.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="bg-primary hover:bg-[#003EA8] text-white font-semibold px-8 py-3 rounded-xl shadow-sm transition-all"
            >
              Volver al Inicio
            </Link>
            <button
              onClick={handleReset}
              className="border border-[#E0E3E5] hover:border-primary text-[#191C1E] hover:text-primary font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Agendar otra cita
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10 text-center md:text-left max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191C1E] tracking-tight mb-3">
          Agenda tu cita técnica
        </h1>
        <p className="text-base sm:text-lg text-[#434655]">
          Servicio rápido, confiable y con garantía técnica. Selecciona el servicio que necesitas o describe el problema de tu equipo para agendar una evaluación con nuestros especialistas.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Frequent Services (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#191C1E]">Servicios Disponibles</h2>
            <Link
              to="/servicios"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ver catálogo completo
            </Link>
          </div>

          {loadingServices && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-[#E0E3E5] rounded-2xl p-5 shadow-sm animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {servicesError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-sm text-red-600">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="font-semibold">No se pudo cargar la lista de servicios</p>
              <p className="text-xs text-red-500 mt-1">Puedes seleccionar o recargar la página para intentar nuevamente.</p>
            </div>
          )}

          {!loadingServices && !servicesError && activeServices.length === 0 && (
            <div className="bg-white border border-[#E0E3E5] rounded-2xl p-6 text-center text-sm text-[#434655]">
              <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold">No hay servicios disponibles en este momento</p>
            </div>
          )}

          {!loadingServices && activeServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {activeServices.slice(0, 4).map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                        : 'border-[#E0E3E5] hover:shadow-md hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {srv.price > 100000 ? <Sparkles className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#191C1E] truncate">{srv.name}</h3>
                        <p className="text-xs text-[#737686] flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" /> 1-2 horas est.
                        </p>
                        {srv.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {srv.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-bold text-primary text-right whitespace-nowrap">
                        ${Number(srv.price).toLocaleString('es-CO')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickSelect(srv.id)}
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-[#E0E3E5] hover:border-primary text-[#191C1E] hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {isSelected ? 'Seleccionado' : 'Solicitar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Form Area (7 cols) */}
        <div className="lg:col-span-7" id="service-form">
          <div className="bg-white border border-[#E0E3E5] rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#191C1E] mb-6 pb-3 border-b border-[#E0E3E5]">
              Detalles del Servicio
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Device Type */}
                <div>
                  <label className="tecno-label">Tipo de dispositivo</label>
                  <div className="relative">
                    <select
                      {...form.register('deviceType')}
                      className="tecno-input appearance-none pr-10"
                    >
                      <option value="smartphone">Smartphone / Celular</option>
                      <option value="laptop">Laptop / Portátil</option>
                      <option value="tablet">Tablet</option>
                      <option value="desktop">PC de Escritorio</option>
                      <option value="other">Otro dispositivo</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {form.formState.errors.deviceType && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.deviceType.message}</p>
                  )}
                </div>

                {/* Service Required */}
                <div>
                  <label className="tecno-label">Servicio requerido</label>
                  <div className="relative">
                    <select
                      {...form.register('serviceId')}
                      className="tecno-input appearance-none pr-10"
                      disabled={loadingServices || activeServices.length === 0}
                    >
                      {loadingServices ? (
                        <option value="">Cargando catálogo...</option>
                      ) : activeServices.length === 0 ? (
                        <option value="">No hay servicios disponibles</option>
                      ) : (
                        <>
                          <option value="" disabled>Selecciona un servicio</option>
                          {activeServices.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (${Number(s.price).toLocaleString('es-CO')} COP)
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {form.formState.errors.serviceId && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.serviceId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="tecno-label">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Apple, Samsung, Dell, Asus"
                    {...form.register('brand')}
                    className="tecno-input"
                  />
                  {form.formState.errors.brand && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.brand.message}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="tecno-label">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. iPhone 13, Galaxy S21, Inspiron 15"
                    {...form.register('model')}
                    className="tecno-input"
                  />
                  {form.formState.errors.model && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.model.message}</p>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="tecno-label">Descripción del problema</label>
                <textarea
                  rows={3}
                  placeholder="Describe brevemente lo que le sucede a tu equipo o el mantenimiento requerido..."
                  {...form.register('description')}
                  className="tecno-input resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="tecno-label">Fecha de visita</label>
                  <input
                    type="date"
                    min={todayStr}
                    {...form.register('date')}
                    className="tecno-input"
                  />
                  {form.formState.errors.date && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.date.message}</p>
                  )}
                </div>

                {/* Time Slot */}
                <div>
                  <label className="tecno-label">Hora preferida</label>
                  <div className="relative">
                    <select
                      {...form.register('timeSlot')}
                      className="tecno-input appearance-none pr-10"
                    >
                      <option value="morning">Mañana (8:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Tarde (1:00 PM - 5:00 PM)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contact Info Header */}
              <div className="pt-4 border-t border-[#E0E3E5]">
                <h3 className="text-sm font-bold text-[#191C1E] uppercase tracking-wider mb-4">
                  Datos de contacto
                </h3>
              </div>

              {/* Customer Name */}
              <div>
                <label className="tecno-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre y apellido"
                  {...form.register('customerName')}
                  className="tecno-input"
                />
                {form.formState.errors.customerName && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Email */}
                <div>
                  <label className="tecno-label">Correo electrónico (Opcional)</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...form.register('email')}
                    className="tecno-input"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="tecno-label">Teléfono / Celular</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3001234567"
                    {...form.register('phone')}
                    className="tecno-input"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {isError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">{getErrorMessage()}</div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || loadingServices || activeServices.length === 0}
                  className="w-full sm:w-auto bg-primary hover:bg-[#003EA8] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Agendando...
                    </>
                  ) : (
                    'Agendar Servicio'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
