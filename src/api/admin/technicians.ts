import { apiClient } from '../client';
import type { 
  Technician, 
  CreateTechnicianRequest, 
  ToggleTechnicianStatusRequest,
  TechnicianWorkOrdersResponse
} from '@/types/technicians';

export const adminTechniciansApi = {
  // GET /technicians no recibe paginación
  getAll: async (): Promise<{ items: Technician[] }> => {
    const { data } = await apiClient.get<{ items: Technician[] }>('/technicians');
    return data;
  },

  create: async (payload: CreateTechnicianRequest): Promise<Technician> => {
    const { data } = await apiClient.post<Technician>('/technicians', payload);
    return data;
  },

  toggleStatus: async (id: string, payload: ToggleTechnicianStatusRequest): Promise<Technician> => {
    const { data } = await apiClient.patch<Technician>(`/technicians/${id}/status`, payload);
    return data;
  },

  getWorkOrders: async (id: string): Promise<TechnicianWorkOrdersResponse> => {
    const { data } = await apiClient.get<TechnicianWorkOrdersResponse>(`/technicians/${id}/work-orders`);
    return data;
  }
};
