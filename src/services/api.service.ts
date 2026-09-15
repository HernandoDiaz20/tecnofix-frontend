import { apiClient } from '@/api/client';
import type { Product, Service, WorkOrder, Appointment } from '@/types';

export const ApiService = {
  getProducts: async (page: number, pageSize: number) => {
    const { data } = await apiClient.get('/products', { params: { page, pageSize } });
    return data;
  },
  getProductById: async (id: string) => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
  getServices: async () => {
    const { data } = await apiClient.get<Service[]>('/services');
    return data;
  },
  createAppointment: async (appointmentData: { serviceId: string; customerName: string; phone: string; date: string }) => {
    const { data } = await apiClient.post<Appointment>('/appointments', appointmentData);
    return data;
  },
  trackWorkOrder: async (guideNumber: string) => {
    const { data } = await apiClient.get<{ order: WorkOrder; history: any[] }>(`/work-orders/track/${guideNumber}`);
    return data;
  }
};
