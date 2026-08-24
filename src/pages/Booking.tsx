import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useServices, useCreateAppointment } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  date: z.string().min(1, 'Selecciona una fecha y hora'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export const Booking = () => {
  const { data: services, isLoading: servicesLoading } = useServices();
  const { mutate: createAppointment, isPending, isSuccess, isError, error } = useCreateAppointment();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { serviceId: '', customerName: '', phone: '', date: '' }
  });

  const onSubmit = (values: BookingFormValues) => {
    // Convierte el valor de "datetime-local" a ISO completo
    const dateObj = new Date(values.date);
    createAppointment({
      ...values,
      date: dateObj.toISOString(),
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card className="rounded-3xl shadow-sm border-brand-success/20 bg-brand-success/5">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-brand-success text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Cita Agendada con Éxito</h2>
            <p className="text-lg text-gray-600 mb-8">
              Te esperamos el {format(new Date(form.getValues('date')), "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })}.
              Si necesitas reprogramar, comunícate con nosotros.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl h-12 px-8 text-lg">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">Agenda tu Servicio Técnico</h1>
        <p className="text-gray-600">Reserva un espacio con nuestros especialistas. El pago se realiza tras la reparación.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100">
        <CardContent className="p-6 md:p-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="serviceId">Servicio Requerido</Label>
              <select
                id="serviceId"
                {...form.register('serviceId')}
                className="w-full flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={servicesLoading}
              >
                <option value="">{servicesLoading ? 'Cargando servicios...' : 'Selecciona una opción...'}</option>
                {services?.map(service => (
                  <option key={service.id} value={service.id}>{service.name} - ${service.price}</option>
                ))}
              </select>
              {form.formState.errors.serviceId && <p className="text-sm text-brand-error">{form.formState.errors.serviceId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre Completo</Label>
                <Input id="customerName" {...form.register('customerName')} className="h-12 rounded-xl" placeholder="Ej. Juan Pérez" />
                {form.formState.errors.customerName && <p className="text-sm text-brand-error">{form.formState.errors.customerName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono de Contacto</Label>
                <Input id="phone" {...form.register('phone')} className="h-12 rounded-xl" placeholder="Ej. 3001234567" />
                {form.formState.errors.phone && <p className="text-sm text-brand-error">{form.formState.errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha y Hora</Label>
              <Input id="date" type="datetime-local" {...form.register('date')} className="h-12 rounded-xl" />
              {form.formState.errors.date && <p className="text-sm text-brand-error">{form.formState.errors.date.message}</p>}
            </div>

            {isError && (
              <div className="p-4 bg-brand-error/10 text-brand-error rounded-xl border border-brand-error/20">
                Hubo un error al procesar tu solicitud. {((error as any)?.response?.data?.error?.message) || 'Intenta de nuevo.'}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white h-14 text-lg rounded-xl mt-8">
              {isPending ? 'Procesando...' : 'Confirmar Cita'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
