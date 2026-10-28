import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPartsApi } from './parts';
import type { 
  CreatePartRequest, 
  UpdatePartRequest, 
} from '@/types/parts';

export const partKeys = {
  all: ['admin-parts'] as const,
  list: (page: number, pageSize: number) => [...partKeys.all, page, pageSize] as const,
};

export const useAdminParts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: partKeys.list(page, pageSize),
    queryFn: () => adminPartsApi.getAll(page, pageSize),
  });
};

export const useCreatePart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePartRequest) => adminPartsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
  });
};

export const useUpdatePart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartRequest }) => 
      adminPartsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.all });
    },
  });
};

export const useAssignPartToWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, partId, quantity }: { workOrderId: string; partId: string; quantity: number }) =>
      adminPartsApi.assignToWorkOrder(workOrderId, { partId, quantity }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-detail', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-history', variables.workOrderId] });
    },
  });
};

