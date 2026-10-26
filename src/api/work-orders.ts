import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  WorkOrder,
  CreateWorkOrderInput,
  TransitionStatusInput,
  ExitRegisterInput,
  StatusHistoryEntry,
  Activity,
  CreateActivityInput,
  Photo,
  Diagnostic,
  CreateDiagnosticInput,
} from '@/types';

export interface WorkOrderQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  searchText?: string;
  fromDate?: string;
}

export interface WorkOrdersResponse {
  items: WorkOrder[];
  total: number;
  page: number;
  pageSize: number;
}

// Listar órdenes de trabajo paginadas
export const useWorkOrders = (params?: WorkOrderQueryParams) => {
  return useQuery({
    queryKey: ['work-orders', params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/work-orders', { params });
      let items: WorkOrder[] = [];
      let total = 0;

      if (Array.isArray(data)) {
        items = data;
        total = data.length;
      } else if (data) {
        items = data.items || data.rows || [];
        total = data.total ?? items.length;
      }

      return {
        items,
        total,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      } as WorkOrdersResponse;
    },
  });
};

// Obtener detalle de una orden
export const useWorkOrderDetail = (id?: string) => {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<WorkOrder>(`/work-orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Crear una nueva orden de trabajo
export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkOrderInput) => {
      const { data } = await apiClient.post<WorkOrder>('/work-orders', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
};

// Transicionar estado de una orden
export const useTransitionOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransitionStatusInput }) => {
      const response = await apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['work-order-history', variables.id] });
    },
  });
};

// Registrar entrega / salida de orden
export const useRegisterExitWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExitRegisterInput }) => {
      const response = await apiClient.post<WorkOrder>(`/work-orders/${id}/exit-register`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.id] });
    },
  });
};

// Obtener historial de estados
export const useWorkOrderHistory = (id?: string) => {
  return useQuery({
    queryKey: ['work-order-history', id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get<any>(`/work-orders/${id}/history`);
      if (Array.isArray(data)) return data as StatusHistoryEntry[];
      if (data && Array.isArray(data.items)) return data.items as StatusHistoryEntry[];
      return [] as StatusHistoryEntry[];
    },
    enabled: !!id,
  });
};

// Bitácora de Actividades
export const useWorkOrderActivities = (id?: string) => {
  return useQuery({
    queryKey: ['work-order-activities', id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get<any>(`/work-orders/${id}/activities`);
      if (Array.isArray(data)) return data as Activity[];
      if (data && Array.isArray(data.items)) return data.items as Activity[];
      return [] as Activity[];
    },
    enabled: !!id,
  });
};

export const useCreateWorkOrderActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateActivityInput }) => {
      const response = await apiClient.post<Activity>(`/work-orders/${id}/activities`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-activities', variables.id] });
    },
  });
};

// Fotos de la orden
export const useWorkOrderPhotos = (id?: string) => {
  return useQuery({
    queryKey: ['work-order-photos', id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get<any>(`/work-orders/${id}/photos`);
      if (Array.isArray(data)) return data as Photo[];
      if (data && Array.isArray(data.items)) return data.items as Photo[];
      return [] as Photo[];
    },
    enabled: !!id,
  });
};

export const useUploadWorkOrderPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file, kind }: { id: string; file: File; kind: 'inicial' | 'final' }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      const response = await apiClient.post<Photo>(`/work-orders/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-photos', variables.id] });
    },
  });
};

// Diagnósticos
export const useWorkOrderDiagnostics = (id?: string) => {
  return useQuery({
    queryKey: ['work-order-diagnostics', id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get<any>(`/work-orders/${id}/diagnostics`);
      if (Array.isArray(data)) return data as Diagnostic[];
      if (data && Array.isArray(data.items)) return data.items as Diagnostic[];
      return [] as Diagnostic[];
    },
    enabled: !!id,
  });
};

export const useCreateWorkOrderDiagnostic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateDiagnosticInput }) => {
      const response = await apiClient.post<Diagnostic>(`/work-orders/${id}/diagnostics`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-diagnostics', variables.id] });
    },
  });
};
