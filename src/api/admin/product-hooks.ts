import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductsApi } from './products';
import type { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ToggleAvailabilityRequest,
  CreateMovementRequest
} from '@/types/products';

export const productKeys = {
  all: ['admin-products'] as const,
  list: (page: number, pageSize: number) => [...productKeys.all, page, pageSize] as const,
  details: () => ['admin-product'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  movements: (id: string) => ['product-movements', id] as const,
};

export const useAdminProducts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: productKeys.list(page, pageSize),
    queryFn: () => adminProductsApi.getAll(page, pageSize),
  });
};

export const useAdminProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => adminProductsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductRequest) => adminProductsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => 
      adminProductsApi.update(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
    },
  });
};

export const useToggleProductAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleAvailabilityRequest }) => 
      adminProductsApi.toggleAvailability(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
    },
  });
};

export const useProductMovements = (id: string) => {
  return useQuery({
    queryKey: productKeys.movements(id),
    queryFn: () => adminProductsApi.getMovements(id),
    enabled: !!id,
  });
};

export const useCreateProductMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMovementRequest }) => 
      adminProductsApi.createMovement(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate movements and the specific product since stock has changed
      queryClient.invalidateQueries({ queryKey: productKeys.movements(updatedProduct.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
