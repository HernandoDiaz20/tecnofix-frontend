import { apiClient } from '../client';
import type { Part, CreatePartRequest, UpdatePartRequest, AssignPartToWorkOrderRequest } from '@/types/parts';
import type { PaginatedResponse } from '@/types/dashboard';

export const adminPartsApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Part>> => {
    const { data } = await apiClient.get<PaginatedResponse<Part>>('/parts', {
      params: { page, pageSize }
    });
    return data;
  },

  create: async (payload: CreatePartRequest): Promise<Part> => {
    const { data } = await apiClient.post<Part>('/parts', payload);
    return data;
  },

  update: async (id: string, payload: UpdatePartRequest): Promise<Part> => {
    const { data } = await apiClient.put<Part>(`/parts/${id}`, payload);
    return data;
  },

  // Preparado para la Fase de Órdenes de Servicio
  assignToWorkOrder: async (workOrderId: string, payload: AssignPartToWorkOrderRequest): Promise<any> => {
    const { data } = await apiClient.post(`/work-orders/${workOrderId}/parts`, payload);
    return data;
  }
};
