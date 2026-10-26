import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { TechService, CreateServiceInput, UpdateServiceInput } from '@/types';

// Listar todos los servicios
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/services');
      if (Array.isArray(data)) {
        return data as TechService[];
      }
      if (data && Array.isArray(data.items)) {
        return data.items as TechService[];
      }
      return [] as TechService[];
    },
  });
};

// Crear nuevo servicio (Solo Administrador)
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newService: CreateServiceInput) => {
      const { data } = await apiClient.post<TechService>('/services', newService);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Editar servicio (Solo Administrador)
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateServiceInput }) => {
      const response = await apiClient.put<TechService>(`/services/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// Desactivar / Eliminar servicio (Solo Administrador)
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
