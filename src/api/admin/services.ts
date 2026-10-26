import { apiClient } from '../client';
import type { 
  Service, 
  ServicesResponse, 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ToggleServiceStatusRequest 
} from '@/types/services';

export const adminServicesApi = {
  // GET /services/admin/all: listar servicios activos e inactivos. Requiere token válido.
  getAll: async (): Promise<ServicesResponse> => {
    const { data } = await apiClient.get<ServicesResponse>('/services/admin/all');
    return data;
  },

  // POST /services: crear un servicio. Requiere rol administrador.
  create: async (payload: CreateServiceRequest): Promise<Service> => {
    const { data } = await apiClient.post<Service>('/services', payload);
    return data;
  },

  // PUT /services/:id: editar parcialmente un servicio. Requiere rol administrador.
  update: async (id: string, payload: UpdateServiceRequest): Promise<Service> => {
    const { data } = await apiClient.put<Service>(`/services/${id}`, payload);
    return data;
  },

  // PATCH /services/:id/status: cambiar su estado mediante { "active": boolean }. Requiere rol administrador.
  toggleStatus: async (id: string, payload: ToggleServiceStatusRequest): Promise<Service> => {
    const { data } = await apiClient.patch<Service>(`/services/${id}/status`, payload);
    return data;
  },

  // DELETE /services/:id: desactivar el servicio; no es un borrado físico.
  deactivate: async (id: string): Promise<void | Service> => {
    const { data } = await apiClient.delete(`/services/${id}`);
    return data;
  },
};
