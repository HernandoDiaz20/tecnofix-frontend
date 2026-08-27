import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCustomersApi } from './customers';
import type { CreateCustomerRequest } from '@/types/customers';

export const customerKeys = {
  all: ['admin-customers'] as const,
  list: (page: number, pageSize: number) => [...customerKeys.all, page, pageSize] as const,
  details: () => ['admin-customer'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  workOrders: (id: string) => ['admin-customer-work-orders', id] as const,
};

export const useAdminCustomers = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: customerKeys.list(page, pageSize),
    queryFn: () => adminCustomersApi.getAll(page, pageSize),
  });
};

export const useAdminCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => adminCustomersApi.getById(id),
    enabled: !!id,
  });
};

export const useCustomerWorkOrders = (id: string) => {
  return useQuery({
    queryKey: customerKeys.workOrders(id),
    queryFn: () => adminCustomersApi.getWorkOrders(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => adminCustomersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};
