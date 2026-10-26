import { apiClient } from '../client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DashboardWorkOrder } from '@/types/dashboard';

export interface AssignTechnicianRequest {
  technicianId: string;
}

export const adminWorkOrdersApi = {
  // Asignar o cambiar técnico en una orden de servicio
  assignTechnician: async (workOrderId: string, technicianId: string): Promise<DashboardWorkOrder> => {
    const { data } = await apiClient.patch<DashboardWorkOrder>(`/work-orders/${workOrderId}/assign-technician`, {
      technicianId,
    });
    return data;
  },
};

export const useAssignTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, technicianId }: { workOrderId: string; technicianId: string }) =>
      adminWorkOrdersApi.assignTechnician(workOrderId, technicianId),
    onSuccess: (updatedOrder, variables) => {
      // Invalidate all related work orders queries to guarantee fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-detail', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });

      // Directly update the detail cache if updated order data is returned
      if (updatedOrder) {
        queryClient.setQueryData(['admin-work-order-detail', variables.workOrderId], (old: any) => {
          if (!old) return updatedOrder;
          return {
            ...old,
            ...updatedOrder,
            technicianId: updatedOrder.technicianId || variables.technicianId,
          };
        });
      }
    },
  });
};
