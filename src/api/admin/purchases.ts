import { apiClient } from '@/api/client';
import type { 
  PurchaseRequest, 
  PurchaseRequestsResponse, 
  CreatePurchaseRequestDto,
  UpdatePurchaseStatusDto
} from '@/types/purchases';

export const adminPurchasesApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PurchaseRequestsResponse> => {
    const response = await apiClient.get('/purchase-requests', {
      params: { page, pageSize }
    });
    return response.data;
  },

  getById: async (id: string): Promise<PurchaseRequest> => {
    const response = await apiClient.get(`/purchase-requests/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseRequestDto): Promise<PurchaseRequest> => {
    const response = await apiClient.post('/purchase-requests', data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdatePurchaseStatusDto): Promise<PurchaseRequest> => {
    const response = await apiClient.patch(`/purchase-requests/${id}/status`, data);
    return response.data;
  },

  receive: async (id: string): Promise<PurchaseRequest> => {
    const response = await apiClient.post(`/purchase-requests/${id}/receive`);
    return response.data;
  }
};
