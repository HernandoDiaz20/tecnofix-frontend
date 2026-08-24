import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { Product, Service, WorkOrder, Appointment } from '@/types';

// Products
export const useProducts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: async () => {
      // Usar endpoint real detectado en API_INTEGRATION.md
      const { data } = await apiClient.get('/products', {
        params: { page, pageSize }
      });
      return data;
    }
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await apiClient.get<Service[]>('/services');
      return data; // Assuming it returns an array of services directly based on standard REST
    }
  });
};

// Appointments
export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: async (appointmentData: { serviceId: string; customerName: string; phone: string; date: string }) => {
      const { data } = await apiClient.post<Appointment>('/appointments', appointmentData);
      return data;
    }
  });
};

// Work Orders (Tracking)
export const useTrackWorkOrder = (guideNumber: string) => {
  return useQuery({
    queryKey: ['track', guideNumber],
    queryFn: async () => {
      const { data } = await apiClient.get<{ order: WorkOrder; history: any[] }>(`/work-orders/track/${guideNumber}`);
      return data; // Endpoint returns 'Orden y su historial' as per documentation
    },
    enabled: false, // Disparamos manualmente (o al tener un string válido)
    retry: false, // No reintentar automáticamente en 404
  });
};
