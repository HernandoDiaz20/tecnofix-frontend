import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPurchasesApi } from './purchases';
import { adminSuppliersApi } from './suppliers';
import type { 
  CreatePurchaseRequestDto, 
  UpdatePurchaseStatusDto 
} from '@/types/purchases';

export const purchaseKeys = {
  all: ['admin-purchases'] as const,
  list: (page: number, pageSize: number) => [...purchaseKeys.all, page, pageSize] as const,
  detail: (id: string) => [...purchaseKeys.all, id] as const,
};

export const supplierKeys = {
  all: ['admin-suppliers'] as const,
  list: (page: number, pageSize: number) => [...supplierKeys.all, page, pageSize] as const,
};

export const useAdminPurchases = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: purchaseKeys.list(page, pageSize),
    queryFn: () => adminPurchasesApi.getAll(page, pageSize),
  });
};

export const useAdminPurchaseDetail = (id: string) => {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => adminPurchasesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePurchaseRequestDto) => adminPurchasesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
};

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseStatusDto }) => 
      adminPurchasesApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(variables.id) });
    },
  });
};

export const useReceivePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminPurchasesApi.receive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      // Invalidate inventory data as well since receiving a purchase updates stock
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parts'] });
    },
  });
};

export const useAdminSuppliers = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: supplierKeys.list(page, pageSize),
    queryFn: () => adminSuppliersApi.getAll(page, pageSize),
  });
};
