import { apiClient } from '@/api/client';
import type { Product, ServicesResponse, Service, WorkOrder, Appointment } from '@/types';

export const ApiService = {
  getProducts: async (page: number, pageSize: number) => {
    const { data } = await apiClient.get('/products', { params: { page, pageSize } });
    return data;
  },
  getProductById: async (id: string) => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
  getServices: async (): Promise<ServicesResponse | Service[]> => {
    const { data } = await apiClient.get<ServicesResponse | Service[]>('/services');
    return data;
  },
  createAppointment: async (appointmentData: {
    serviceId: string;
    customerName: string;
    phone: string;
    date: string;
    deviceBrand?: string;
    deviceModel?: string;
    problemDescription?: string;
  }) => {
    const { data } = await apiClient.post<Appointment>('/appointments', appointmentData);
    return data;
  },
  trackWorkOrder: async (guideNumber: string) => {
    const { data } = await apiClient.get<{ order: WorkOrder; history: any[] }>(`/work-orders/track/${guideNumber}`);
    return data;
  },
  assignTechnician: async (workOrderId: string, technicianId: string) => {
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${workOrderId}/assign-technician`, {
      technicianId,
    });
    return data;
  },
  confirmAppointment: async (id: string) => {
    const { data } = await apiClient.patch<Appointment>(`/appointments/${id}/confirm`);
    return data;
  },
  cancelAppointment: async (id: string) => {
    const { data } = await apiClient.patch<Appointment>(`/appointments/${id}/cancel`);
    return data;
  },
  completeAppointment: async (id: string, payload?: { completedServices?: string; completedNotes?: string }) => {
    const { data } = await apiClient.patch<Appointment>(`/appointments/${id}/complete`, {
      completedServices: payload?.completedServices || 'Servicio realizado en el momento',
      completedNotes: payload?.completedNotes,
    });
    return data;
  },
  convertAppointmentToOrder: async (id: string, payload: {
    deviceBrand?: string;
    deviceModel?: string;
    deviceSerial?: string;
    problemDescription?: string;
    technicianId?: string | null;
    customerId?: string | null;
    devicePassword?: string;
    accessories?: string;
  }) => {
    const { data } = await apiClient.post<{ appointment: Appointment; workOrder: WorkOrder }>(
      `/appointments/${id}/convert`,
      payload
    );
    return data;
  },
};
