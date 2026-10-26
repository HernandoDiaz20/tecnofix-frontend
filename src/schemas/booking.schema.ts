import * as z from 'zod';

export const bookingSchema = z.object({
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

export type BookingFormValues = z.infer<typeof bookingSchema>;
