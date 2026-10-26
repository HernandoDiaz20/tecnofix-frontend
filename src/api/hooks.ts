import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentData: {
      serviceId: string;
      customerName: string;
      phone: string;
      date: string;
      deviceBrand?: string;
      deviceModel?: string;
      problemDescription?: string;
    }) => {
      return ApiService.createAppointment(appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
