import { apiClient } from '../client';
import type { Product } from '@/types';
import type { PaginatedResponse } from '@/types/dashboard';
import type { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ToggleAvailabilityRequest,
  CreateMovementRequest,
  ProductMovementsResponse
} from '@/types/products';

export const adminProductsApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Product>> => {
    // Note: The endpoint returns items & total. Pagination is frontend-driven for now if page/pageSize are not fully supported
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products/admin/all', {
      params: { page, pageSize }
    });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (payload: CreateProductRequest): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },

  update: async (id: string, payload: UpdateProductRequest): Promise<Product> => {
    const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  toggleAvailability: async (id: string, payload: ToggleAvailabilityRequest): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/products/${id}/availability`, payload);
    return data;
  },

  getMovements: async (id: string): Promise<ProductMovementsResponse> => {
    const { data } = await apiClient.get<ProductMovementsResponse>(`/products/${id}/movements`);
    return data;
  },

  createMovement: async (id: string, payload: CreateMovementRequest): Promise<Product> => {
    // Returns the updated product as per contract
    const { data } = await apiClient.post<Product>(`/products/${id}/movements`, payload);
    return data;
  }
};
