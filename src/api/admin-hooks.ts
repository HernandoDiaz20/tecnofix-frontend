import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiService } from '@/services/api.service';
import type { 
  PaginatedResponse, 
  DashboardProduct, 
  DashboardCustomer, 
  DashboardPart,
  DashboardWorkOrder,
  DashboardAppointment,
  DashboardWorkOrderHistory,
  DashboardWorkOrderDiagnostic
} from '@/types/dashboard';

export const useAdminProductsCount = () => {
  return useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardProduct>>('/products?page=1&pageSize=1');
      return data.total;
    }
  });
};

export const useAdminCustomersCount = () => {
  return useQuery({
    queryKey: ['admin-customers-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardCustomer>>('/customers?page=1&pageSize=1');
      return data.total;
    }
  });
};

export const useAdminPartsCount = () => {
  return useQuery({
    queryKey: ['admin-parts-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardPart>>('/parts?page=1&pageSize=1');
      return data.total;
    }
  });
};

export const useAdminTechniciansCount = () => {
  return useQuery({
    queryKey: ['admin-technicians-count'],
    queryFn: async () => {
      // Backend currently returning 500 for /technicians. This will throw an error handled by react-query.
      const { data } = await apiClient.get<any>('/technicians');
      return data?.items?.length || 0;
    }
  });
};

export const useAdminRecentOrders = () => {
  return useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardWorkOrder>>('/work-orders?page=1&pageSize=5');
      return data.items;
    }
  });
};

export const useAdminTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['admin-today-appointments', today],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardAppointment>>(`/appointments?from=${today}&to=${today}`);
      return data.items;
    }
  });
};

export const useAdminPendingAppointments = () => {
  return useQuery({
    queryKey: ['admin-pending-appointments'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DashboardAppointment>>('/appointments?status=pendiente');
      return data.items;
    }
  });
};

export const useAdminAppointments = (page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: ['admin-appointments', page, pageSize, status],
    queryFn: async () => {
      let url = `/appointments?page=${page}&pageSize=${pageSize}`;
      if (status && status !== 'all') {
        const backendStatus = status === 'aceptada' ? 'confirmada' : status;
        url += `&status=${backendStatus}`;
      }
      const { data } = await apiClient.get<PaginatedResponse<DashboardAppointment>>(url);
      return data;
    }
  });
};

export const useAdminAppointmentById = (id?: string | null) => {
  return useQuery({
    queryKey: ['admin-appointment', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<DashboardAppointment>(`/appointments/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return ApiService.confirmAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return ApiService.cancelAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: string | { id: string; payload?: { completedServices?: string; completedNotes?: string } }) => {
      const id = typeof args === 'string' ? args : args.id;
      const payload = typeof args === 'string' ? undefined : args.payload;
      return ApiService.completeAppointment(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useConvertAppointmentToOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        deviceBrand?: string;
        deviceModel?: string;
        deviceSerial?: string;
        problemDescription?: string;
        technicianId?: string | null;
        customerId?: string | null;
        devicePassword?: string;
        accessories?: string;
      };
    }) => {
      return ApiService.convertAppointmentToOrder(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useAdminOrdersByStatus = () => {
  return useQuery({
    queryKey: ['admin-orders-by-status'],
    queryFn: async () => {
      // Backend currently returning 500 for this endpoint.
      const { data } = await apiClient.get<any>('/reports/orders-by-status');
      return data;
    }
  });
};

// ==========================================
// WORK ORDERS MODULE
// ==========================================

export const useAdminWorkOrders = (page: number, pageSize: number, status?: string, technicianId?: string) => {
  return useQuery({
    queryKey: ['admin-work-orders', page, pageSize, status, technicianId],
    queryFn: async () => {
      let url = `/work-orders?page=${page}&pageSize=${pageSize}`;
      if (status) url += `&status=${status}`;
      if (technicianId) url += `&technicianId=${technicianId}`;
      const { data } = await apiClient.get<PaginatedResponse<DashboardWorkOrder>>(url);
      return data;
    }
  });
};

export const useAdminWorkOrderDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-work-order-detail', id],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardWorkOrder>(`/work-orders/${id}`);
      return data;
    },
    enabled: !!id
  });
};

export const useAdminWorkOrderHistory = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-work-order-history', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: DashboardWorkOrderHistory[] }>(`/work-orders/${id}/history`);
      return data.items;
    },
    enabled: !!id
  });
};

export const useAdminWorkOrderDiagnostics = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-work-order-diagnostics', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: DashboardWorkOrderDiagnostic[] }>(`/work-orders/${id}/diagnostics`);
      return data.items;
    },
    enabled: !!id
  });
};
