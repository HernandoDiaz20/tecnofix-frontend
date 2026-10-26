import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminServicesApi } from './services';
import type { 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ToggleServiceStatusRequest 
} from '@/types/services';

export const serviceKeys = {
  all: ['admin-services'] as const,
  public: ['services'] as const,
};

export const useAdminServices = () => {
  return useQuery({
    queryKey: serviceKeys.all,
    queryFn: () => adminServicesApi.getAll(),
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => adminServicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceKeys.public });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) => 
      adminServicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceKeys.public });
    },
  });
};

export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleServiceStatusRequest }) => 
      adminServicesApi.toggleStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceKeys.public });
    },
  });
};

export const useDeactivateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminServicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceKeys.public });
    },
  });
};
