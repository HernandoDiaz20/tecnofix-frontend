import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTechniciansApi } from './technicians';
import type { 
  CreateTechnicianRequest, 
  ToggleTechnicianStatusRequest 
} from '@/types/technicians';

export const technicianKeys = {
  all: ['admin-technicians'] as const,
  workOrders: (id: string) => ['admin-technician-work-orders', id] as const,
};

export const useAdminTechnicians = () => {
  return useQuery({
    queryKey: technicianKeys.all,
    queryFn: () => adminTechniciansApi.getAll(),
  });
};

export const useTechnicianWorkOrders = (id: string) => {
  return useQuery({
    queryKey: technicianKeys.workOrders(id),
    queryFn: () => adminTechniciansApi.getWorkOrders(id),
    enabled: !!id,
  });
};

export const useCreateTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTechnicianRequest) => adminTechniciansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: technicianKeys.all });
    },
  });
};

export const useToggleTechnicianStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleTechnicianStatusRequest }) => 
      adminTechniciansApi.toggleStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: technicianKeys.all });
    },
  });
};
