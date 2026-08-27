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
