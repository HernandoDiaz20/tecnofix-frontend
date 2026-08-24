import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { 
  PaginatedResponse, 
  DashboardProduct, 
  DashboardCustomer, 
  DashboardPart,
  DashboardWorkOrder,
  DashboardAppointment
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
