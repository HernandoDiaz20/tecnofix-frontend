export interface Part {
  id: string;
  name: string;
  sku: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
  createdAt: string;
}

export interface CreatePartRequest {
  name: string;
  sku: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
}

export interface UpdatePartRequest {
  name?: string;
  sku?: string;
  purchasePrice?: number;
  salePrice?: number;
}

export interface AssignPartToWorkOrderRequest {
  partId: string;
  quantity: number;
}
