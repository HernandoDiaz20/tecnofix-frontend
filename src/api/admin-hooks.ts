import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
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
