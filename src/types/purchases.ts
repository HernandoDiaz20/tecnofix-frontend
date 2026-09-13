export type PurchaseStatus = 'PENDIENTE' | 'ORDENADO' | 'RECIBIDO' | 'CANCELADO';

export interface PurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  productId: string | null;
  partId: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface PurchaseRequest {
  id: string;
  supplierId: string | null;
  status: PurchaseStatus;
  totalItems: number;
  subtotal: number;
  total: number;
  notes: string | null;
  createdBy: string | null;
  items: PurchaseRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseItemDto {
  productId: string | null;
  partId: string | null;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseRequestDto {
  supplierId: string | null;
  items: CreatePurchaseItemDto[];
  notes: string | null;
}

export interface UpdatePurchaseStatusDto {
  status: 'ORDENADO' | 'CANCELADO';
}

export interface PurchaseRequestsResponse {
  items: PurchaseRequest[];
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersResponse {
  items: Supplier[];
  total: number;
}
