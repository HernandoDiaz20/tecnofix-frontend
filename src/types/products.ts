

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: string | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
  categoryId?: string | null;
  purchasePrice?: number;
  salePrice?: number;
}

export interface ToggleAvailabilityRequest {
  active: boolean;
}

export interface ProductMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export interface CreateMovementRequest {
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
}

export interface ProductMovementsResponse {
  items: ProductMovement[];
}
