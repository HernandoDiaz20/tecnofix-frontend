import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';

// Products
export const useProducts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => ApiService.getProducts(page, pageSize),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ApiService.getProductById(id),
    enabled: !!id,
  });
};

// Services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => ApiService.getServices(),
  });
};

// Appointments
export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (appointmentData: { serviceId: string; customerName: string; phone: string; date: string }) => {
      return ApiService.createAppointment(appointmentData);
    },
  });
};

// Work Orders (Tracking)
export const useTrackWorkOrder = (guideNumber: string) => {
  return useQuery({
    queryKey: ['track', guideNumber],
    queryFn: () => ApiService.trackWorkOrder(guideNumber),
    enabled: false, // Disparamos manualmente (o al tener un string válido)
    retry: false, // No reintentar automáticamente en 404
  });
};
