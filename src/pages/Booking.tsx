import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useServices, useCreateAppointment } from '@/api/hooks';
import { 
  Search, 
  Smartphone, 
  BatteryCharging, 
  Sparkles, 
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const bookingSchema = z.object({
  deviceType: z.string().min(1, 'Selecciona el tipo de dispositivo'),
  brand: z.string().min(1, 'Indica la marca'),
  model: z.string().min(1, 'Indica el modelo'),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  description: z.string().optional(),
  date: z.string().min(1, 'Selecciona la fecha de visita'),
  timeSlot: z.string().min(1, 'Selecciona un horario preferido'),
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido').optional().or(z.literal('')),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export const Booking = () => {
  const { data: rawServicesData } = useServices();
  const apiServices: any[] = Array.isArray(rawServicesData) 
    ? rawServicesData 
    : ((rawServicesData as any)?.items || (rawServicesData as any)?.services || []);
  const { mutate: createAppointment, isPending, isSuccess, isError, error } = useCreateAppointment();

  const defaultServices = [
    {
      id: 'srv-1',
      name: 'Diagnóstico Técnico',
      duration: '1-2 horas',
      price: 0,
      priceLabel: '$0 COP',
      icon: Search,
    },
    {
      id: 'srv-2',
      name: 'Cambio de Pantalla',
      duration: '2-4 horas',
      price: 250000,
      priceLabel: 'Desde $250.000 COP',
      icon: Smartphone,
    },
    {
      id: 'srv-3',
      name: 'Cambio de Batería',
      duration: '1-2 horas',
      price: 120000,
      priceLabel: 'Desde $120.000 COP',
      icon: BatteryCharging,
    },
    {
      id: 'srv-4',
      name: 'Mantenimiento Preventivo',
      duration: '2-3 horas',
      price: 85000,
      priceLabel: '$85.000 COP',
      icon: Sparkles,
    },
  ];

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      deviceType: 'smartphone',
      brand: '',
      model: '',
      serviceId: defaultServices[0].id,
      description: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'morning',
      customerName: '',
      email: '',
      phone: '',
    },
  });

  const handleQuickSelect = (serviceId: string) => {
    form.setValue('serviceId', serviceId);
    // Scroll smoothly to form
    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = (values: BookingFormValues) => {
    const appointmentDate = new Date(`${values.date}T10:00:00.000Z`).toISOString();
    createAppointment({
      serviceId: values.serviceId,
      customerName: values.customerName,
      phone: values.phone,
      date: appointmentDate,
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E0E3E5] p-10 md:p-14">
          <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#191C1E] mb-3">
            ¡Cita Agendada con Éxito!
          </h2>
          <p className="text-base text-[#434655] mb-6">
            Hemos registrado tu solicitud para el{' '}
            <strong className="text-[#191C1E]">
              {format(new Date(`${form.getValues('date')}T12:00:00`), "EEEE d 'de' MMMM", { locale: es })}
            </strong>
            . Un asesor se comunicará contigo vía WhatsApp para confirmar los detalles de recepción.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-primary hover:bg-[#003EA8] text-white font-semibold px-8 py-3 rounded-xl shadow-sm transition-all"
            >
              Volver al Inicio
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
          Servicio rápido, confiable y con garantía. Selecciona el servicio que necesitas o describe el problema de tu equipo para agendar una evaluación.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Frequent Services (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold text-[#191C1E] mb-2">Servicios Frecuentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {defaultServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white border border-[#E0E3E5] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[#191C1E]">{srv.name}</h3>
                      <p className="text-xs text-[#737686] flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" /> {srv.duration}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-primary text-right">
                      {srv.priceLabel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickSelect(srv.id)}
                    className="w-full border border-[#E0E3E5] hover:border-primary text-[#191C1E] hover:text-primary hover:bg-primary/5 rounded-xl py-2.5 text-sm font-semibold transition-all"
                  >
                    Solicitar
                  </button>
                </div>
              );
            })}
          </div>
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
                </div>

                {/* Service Required */}
                <div>
                  <label className="tecno-label">Servicio requerido</label>
                  <div className="relative">
                    <select
                      {...form.register('serviceId')}
                      className="tecno-input appearance-none pr-10"
                    >
                      {defaultServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      {apiServices?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (${s.price})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="tecno-label">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Apple, Samsung, Dell"
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
                    placeholder="Ej. iPhone 13, Galaxy S21"
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
                  placeholder="Describe brevemente lo que le sucede a tu equipo..."
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
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="tecno-label">Teléfono / Celular</label>
                  <input
                    type="tel"
                    placeholder="Número de WhatsApp"
                    {...form.register('phone')}
                    className="tecno-input"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {isError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
                  {((error as any)?.response?.data?.error?.message) ||
                    'Hubo un problema al procesar la cita. Por favor intenta de nuevo.'}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-[#003EA8] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {isPending ? 'Agendando...' : 'Agendar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
