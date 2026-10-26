import { apiClient } from '@/api/client';
import type { Supplier, SuppliersResponse } from '@/types/purchases';

export const adminSuppliersApi = {
  getAll: async (page = 1, pageSize = 50): Promise<SuppliersResponse> => {
    const response = await apiClient.get('/suppliers', {
      params: { page, pageSize }
    });
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Supplier> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  }
};
