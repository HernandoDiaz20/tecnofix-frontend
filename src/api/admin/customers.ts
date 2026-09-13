import { apiClient } from '../client';
import type { 
  Customer, 
  CreateCustomerRequest, 
  UpdateCustomerRequest,
  CustomerWorkOrdersResponse 
} from '@/types/customers';
import type { PaginatedResponse } from '@/types/dashboard';

export const adminCustomersApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Customer>> => {
    const { data } = await apiClient.get<PaginatedResponse<Customer>>('/customers', {
      params: { page, pageSize }
    });
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },

  create: async (payload: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>('/customers', payload);
    return data;
  },

  update: async (id: string, payload: UpdateCustomerRequest): Promise<Customer> => {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  getWorkOrders: async (id: string): Promise<CustomerWorkOrdersResponse> => {
    const { data } = await apiClient.get<CustomerWorkOrdersResponse>(`/customers/${id}/work-orders`);
    return data;
  }
};
