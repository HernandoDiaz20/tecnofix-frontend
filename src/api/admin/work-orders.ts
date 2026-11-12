import { apiClient } from '../client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DashboardWorkOrder } from '@/types/dashboard';

export interface AssignTechnicianRequest {
  technicianId: string;
}

export interface RegisterExitRequest {
  finalState: string;
  repairsPerformed: string;
  partsUsed?: string;
  observations?: string;
}

export const adminWorkOrdersApi = {
  // Asignar o cambiar técnico en una orden de servicio
  assignTechnician: async (workOrderId: string, technicianId: string): Promise<DashboardWorkOrder> => {
    const { data } = await apiClient.patch<DashboardWorkOrder>(`/work-orders/${workOrderId}/assign-technician`, {
      technicianId,
    });
    return data;
  },

  // Transición de estado en la máquina de estados
  transitionStatus: async (workOrderId: string, toStatus: string): Promise<DashboardWorkOrder> => {
    const { data } = await apiClient.patch<DashboardWorkOrder>(`/work-orders/${workOrderId}/status`, {
      toStatus,
    });
    return data;
  },

  // Registrar entrega/salida de la orden
  registerExit: async (workOrderId: string, payload: RegisterExitRequest): Promise<DashboardWorkOrder> => {
    const { data } = await apiClient.post<DashboardWorkOrder>(`/work-orders/${workOrderId}/exit-register`, payload);
    return data;
  },
};

export const useAssignTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, technicianId }: { workOrderId: string; technicianId: string }) =>
      adminWorkOrdersApi.assignTechnician(workOrderId, technicianId),
    onSuccess: (updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-detail', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-history', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });

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

export const useTransitionOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, toStatus }: { workOrderId: string; toStatus: string }) =>
      adminWorkOrdersApi.transitionStatus(workOrderId, toStatus),
    onSuccess: (_updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-detail', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-history', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });
    },
  });
};

export const useRegisterOrderExit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, payload }: { workOrderId: string; payload: RegisterExitRequest }) =>
      adminWorkOrdersApi.registerExit(workOrderId, payload),
    onSuccess: (_updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-detail', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-order-history', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });
    },
  });
};

